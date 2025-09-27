// Updated CourseCatalog component
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Clock, Users, Star, ArrowRight, IndianRupee } from 'lucide-react';
import { courseService, Course } from '../../src/services/CourseService';

interface CourseCatalogProps {
  onNavigate: (page: string) => void;
  user: any;
}

const CourseCatalog: React.FC<CourseCatalogProps> = ({ onNavigate, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from backend
useEffect(() => {
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesData = await courseService.getAllCourses();
      
      // Check if we got any courses
      if (coursesData && coursesData.length > 0) {
        setCourses(coursesData);
      } else {
        throw new Error('No courses available from server');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load courses. Please try again later.';
      setError(errorMessage);
      
      // Fallback to sample data if API fails
      if (sampleCourses.length > 0) {
        setCourses(sampleCourses);
        setError('Using sample data: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchCourses();
}, []);

  // Sample data for fallback (keep your existing sampleCourses)
  const sampleCourses: Course[] = [
    // ... your existing sample courses data
  ];

  // Extract categories and levels from actual courses
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(courses.map(course => course.category)));
    return ['All', ...uniqueCategories];
  }, [courses]);

  const levels = ['All', 'Undergraduate', 'Postgraduate', 'Doctoral'];
  const priceRanges = ['All', 'Under ₹15,000', '₹15,000 - ₹20,000', 'Above ₹20,000'];

  // Filter courses based on current filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
      const matchesPrice = priceRange === 'All' ||
        (priceRange === 'Under ₹15,000' && course.fees < 15000) ||
        (priceRange === '₹15,000 - ₹20,000' && course.fees >= 15000 && course.fees <= 20000) ||
        (priceRange === 'Above ₹20,000' && course.fees > 20000);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });
  }, [searchTerm, selectedCategory, selectedLevel, priceRange, courses]);

  const toggleCompare = (courseId: string) => {
    setCompareList(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : prev.length < 3 ? [...prev, courseId] : prev
    );
  };

  const handleApplyToCourse = async (courseId: string) => {
    if (!user) {
      onNavigate('login');
      return;
    }

    try {
      // You might want to track course views or applications here
      // await courseService.trackCourseView(courseId, user.id);
      
      // Navigate to application page with course ID
      onNavigate(`application?courseId=${courseId}`);
    } catch (error) {
      console.error('Error applying to course:', error);
      // Still navigate to application page even if tracking fails
      onNavigate(`application?courseId=${courseId}`);
    }
  };

  const handleCompareSelected = () => {
    if (compareList.length > 0) {
      // Navigate to comparison page with selected course IDs
      onNavigate(`compare?courses=${compareList.join(',')}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Courses</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">College Course Catalog</h1>
          <p className="text-xl text-gray-600">Discover programs to advance your academic journey</p>
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> {error} Showing cached data.
              </p>
            </div>
          )}
        </div>

        {/* Filters Section - Rest of your existing JSX remains the same */}
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priceRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Compare Bar */}
        {compareList.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Comparing {compareList.length} course{compareList.length !== 1 ? 's' : ''}
                </span>
                <div className="flex space-x-2">
                  {compareList.map(courseId => {
                    const course = courses.find(c => c.id === courseId);
                    return course ? (
                      <span key={courseId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {course.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleCompareSelected}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Compare Selected
                </button>
                <button 
                  onClick={() => setCompareList([])}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-6">
                {/* ... your existing course card JSX ... */}
                {/* Keep all your existing course card structure */}
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleCompare(course.id)}
                      className={`p-2 mr-2 rounded-full transition-colors ${
                        compareList.includes(course.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      disabled={!compareList.includes(course.id) && compareList.length >= 3}
                      title={!compareList.includes(course.id) && compareList.length >= 3 ? 
                        'Maximum 3 courses can be compared' : 'Add to comparison'
                      }
                    >
                      <Filter className="h-4 w-4" />
                    </button>
                    <h3 className="text-lg font-bold text-gray-900">{course.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{course.rating}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                    {course.category}
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students} students</span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  {course.features.slice(0, 2).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-1">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-gray-900">{course.fees.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleApplyToCourse(course.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your filters to find more courses.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedLevel('All');
                setPriceRange('All');
              }}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;