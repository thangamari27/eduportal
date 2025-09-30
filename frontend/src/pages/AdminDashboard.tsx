import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar
} from 'lucide-react';

import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';

interface AdminDashboardProps {
  user: any;
  onNavigate: (page: string) => void;
}

interface Application {
  id: number;
  name: string;
  email: string;
  course: string;
  status: string;
  submittedDate: string;
  phone: string;
  academicScore: string;
  address: string;
  dateOfBirth: string;
  previousEducation: string;
}

interface Course {
  id: number;
  title: string;
  category: string;
  duration: string;
  fee: number;
  totalSeats: number;
  filledSeats: number;
  status: string;
  description: string;
  eligibility: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onNavigate }) => {
  const { user: authUser } = useAuth();
  const {
    stats,
    applications: realApplications,
    courses: realCourses,
    statsLoading,
    applicationsLoading,
    coursesLoading,
    refreshStats,
    refreshApplications,
    refreshCourses,
    updateApplicationStatus,
    createCourse,
    updateCourse,
    deleteCourse
  } = useAdmin();

  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showManageSeatsModal, setShowManageSeatsModal] = useState(false);
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);
  const [newSeats, setNewSeats] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Transform real data to match UI format
  const statsData = stats ? [
    { 
      label: 'Total Applications', 
      value: stats.totalApplications?.toString() || '0', 
      change: '+12%', 
      icon: FileText, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Pending Review', 
      value: stats.pendingApplications?.toString() || '0', 
      change: '+5%', 
      icon: Clock, 
      color: 'text-yellow-600' 
    },
    { 
      label: 'Approved', 
      value: stats.approvedApplications?.toString() || '0', 
      change: '+8%', 
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      label: 'Rejected Applications', 
      value: stats.rejectedApplications?.toString() || '0', 
      change: '+3%', 
      icon: AlertCircle, 
      color: 'text-red-600' 
    }
  ] : [];

  // Transform real applications to match your UI format
  const transformedApplications = realApplications.map((app: any) => ({
    id: app.admission_id,
    name: app.personalInfo ? `${app.personalInfo.first_name} ${app.personalInfo.last_name}` : 'N/A',
    email: app.email,
    course: app.academicInfo?.course_name || 'N/A',
    status: app.application_status?.toLowerCase() || 'pending',
    submittedDate: new Date(app.admission_timestamp).toLocaleDateString(),
    phone: app.personalInfo?.phone || 'N/A',
    academicScore: 'N/A',
    address: 'N/A',
    dateOfBirth: 'N/A',
    previousEducation: 'N/A'
  }));

  // Transform real courses to match your UI format
  const transformedCourses = realCourses.map((course: any) => ({
    id: course.id,
    title: course.name,
    category: 'General',
    duration: course.duration || 'N/A',
    fee: parseFloat(course.fees) || 0,
    totalSeats: course.courseSeats?.reduce((sum: number, seat: any) => sum + seat.seats, 0) || 0,
    filledSeats: 0,
    status: 'active',
    description: course.eligibility || 'No description available',
    eligibility: course.eligibility || 'No eligibility criteria specified'
  }));

  // Data loading effect
  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeTab === 'overview') {
          await refreshStats();
          await refreshApplications();
        } else if (activeTab === 'applications') {
          await refreshApplications();
        } else if (activeTab === 'courses') {
          await refreshCourses();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [activeTab, refreshStats, refreshApplications, refreshCourses]);

  // Use transformed data for filtering and display
  const applications = transformedApplications;
  const courses = transformedCourses;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

 // Update the handleUpdateApplicationStatus function to ensure type safety
const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
  try {
    // Convert the string to the expected type
    const status: 'Pending' | 'Approved' | 'Rejected' = 
      newStatus === 'pending' ? 'Pending' :
      newStatus === 'approved' ? 'Approved' :
      newStatus === 'rejected' ? 'Rejected' : 'Pending';
    
    await updateApplicationStatus(applicationId, status);
    // Context will automatically refresh
  } catch (error) {
    console.error('Error updating application status:', error);
    alert('Failed to update application status');
  }
};

  const handleDeleteApplication = async (applicationId: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await refreshApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Failed to delete application');
      }
    }
  };

  const handleAddNewCourse = async (courseData: any) => {
    try {
      await createCourse({
        name: courseData.title,
        fees: courseData.fee,
        duration: courseData.duration,
        eligibility: courseData.eligibility,
      });
      setShowAddCourseModal(false);
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course');
    }
  };

  const handleUpdateCourse = async (courseId: number, updatedCourse: any) => {
    try {
      await updateCourse(courseId, {
        name: updatedCourse.title,
        fees: updatedCourse.fee,
        duration: updatedCourse.duration,
        eligibility: updatedCourse.eligibility,
      });
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId);
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course');
      }
    }
  };

  // Existing UI functions (unchanged)
  const viewApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const viewCourseDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetailsModal(true);
  };

  const openManageSeats = (course: Course) => {
    setSelectedCourse(course);
    setNewSeats(course.totalSeats);
    setShowManageSeatsModal(true);
  };

  const saveSeats = () => {
    if (selectedCourse) {
      if (newSeats < selectedCourse.filledSeats) {
        alert(`Error: Total seats cannot be less than filled seats (${selectedCourse.filledSeats})`);
        return;
      }
      handleUpdateCourse(selectedCourse.id, { totalSeats: newSeats });
      setShowManageSeatsModal(false);
    }
  };

  // Filtering and pagination (using transformed data)
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const currentApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // User display name function (unchanged)
  type UserType = {
    name?: string;
    email?: string;
    role?: string;
  };

  const getDisplayName = (user: UserType | null): string => {
    if (!user) return 'Student';

    if (user.email) {
      const nameFromEmail = user.email.split('@')[0];
      const cleanedName = nameFromEmail.replace(/[^a-zA-Z]/g, '');
      return cleanedName
        ? cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1).toLowerCase()
        : 'Student';
    }

    return user.role === 'admin' ? 'Administrator' : 'Student';
  };

  // Application Detail Modal (unchanged)
  const ApplicationModal = () => {
    if (!selectedApplication) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
            <button onClick={() => setShowApplicationModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Applicant Name</p>
                  <p className="font-medium text-gray-900">{selectedApplication.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedApplication.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{selectedApplication.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <GraduationCap className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Academic Score</p>
                  <p className="font-medium text-gray-900">{selectedApplication.academicScore}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium text-gray-900">{selectedApplication.course}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-100 rounded-full">
                  <Calendar className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-medium text-gray-900">{selectedApplication.submittedDate}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">{selectedApplication.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Previous Education</p>
                  <p className="font-medium text-gray-900">{selectedApplication.previousEducation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{selectedApplication.address}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Application Status</h3>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
                {selectedApplication.status.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowApplicationModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Course Modal (unchanged)
  const AddCourseModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      category: '',
      duration: '',
      fee: 0,
      totalSeats: 0,
      filledSeats: 0,
      status: 'active',
      description: '',
      eligibility: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.title.trim()) newErrors.title = 'Course title is required';
      if (!formData.category.trim()) newErrors.category = 'Category is required';
      if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
      if (formData.fee <= 0) newErrors.fee = 'Fee must be greater than 0';
      if (formData.totalSeats <= 0) newErrors.totalSeats = 'Total seats must be greater than 0';
      if (formData.filledSeats < 0) newErrors.filledSeats = 'Filled seats cannot be negative';
      if (formData.filledSeats > formData.totalSeats) newErrors.filledSeats = 'Filled seats cannot exceed total seats';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.eligibility.trim()) newErrors.eligibility = 'Eligibility criteria is required';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        handleAddNewCourse(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Add New Course</h2>
            <button onClick={() => setShowAddCourseModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., B.Sc. Computer Science"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commerce">Commerce</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 3 years"
                />
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee (₹) *</label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fee ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fee && <p className="text-red-500 text-xs mt-1">{errors.fee}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats *</label>
                <input
                  type="number"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.totalSeats ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalSeats && <p className="text-red-500 text-xs mt-1">{errors.totalSeats}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filled Seats *</label>
                <input
                  type="number"
                  value={formData.filledSeats}
                  onChange={(e) => setFormData({ ...formData, filledSeats: Number(e.target.value) })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.filledSeats ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.filledSeats && <p className="text-red-500 text-xs mt-1">{errors.filledSeats}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the course content and objectives..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility Criteria *</label>
              <textarea
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.eligibility ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 10+2 with Science stream and minimum 60% marks"
              />
              {errors.eligibility && <p className="text-red-500 text-xs mt-1">{errors.eligibility}</p>}
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Course
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Manage Seats Modal (unchanged)
  const ManageSeatsModal = () => {
    if (!selectedCourse) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Manage Seats - {selectedCourse.title}</h2>
            <button onClick={() => setShowManageSeatsModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Current Enrollment: {selectedCourse.filledSeats} / {selectedCourse.totalSeats} seats filled
                ({Math.round((selectedCourse.filledSeats / selectedCourse.totalSeats) * 100)}%)
              </p>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Total Seats:</span>
              <span className="font-medium text-gray-900">{selectedCourse.totalSeats}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Filled Seats:</span>
              <span className="font-medium text-gray-900">{selectedCourse.filledSeats}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Total Seats</label>
              <input
                type="number"
                min={selectedCourse.filledSeats}
                value={newSeats}
                onChange={(e) => setNewSeats(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Note: Total seats cannot be less than currently filled seats ({selectedCourse.filledSeats})
              </p>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowManageSeatsModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSeats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Seats
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Course Details Modal (unchanged)
  const CourseDetailsModal = () => {
    if (!selectedCourse) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Course Details</h2>
            <button onClick={() => setShowCourseDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Course Title</h3>
                <p className="text-lg font-medium text-gray-900">{selectedCourse.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-lg font-medium text-gray-900">{selectedCourse.category}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                <p className="text-lg font-medium text-gray-900">{selectedCourse.duration}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fee</h3>
                <p className="text-lg font-medium text-gray-900">₹{selectedCourse.fee.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Seats</h3>
                <p className="text-lg font-medium text-gray-900">
                  {selectedCourse.filledSeats} / {selectedCourse.totalSeats} filled
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  selectedCourse.status === 'active' 
                    ? 'text-green-600 bg-green-100' 
                    : 'text-red-600 bg-red-100'
                }`}>
                  {selectedCourse.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700">{selectedCourse.description}</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Eligibility Criteria</h3>
              <p className="text-gray-700">{selectedCourse.eligibility}</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Enrollment Progress</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round((selectedCourse.filledSeats / selectedCourse.totalSeats) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedCourse.filledSeats / selectedCourse.totalSeats) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowCourseDetailsModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => openManageSeats(selectedCourse)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Seats
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render functions with loading states
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          // Loading skeleton
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="p-3 rounded-full bg-gray-200"></div>
              </div>
            </div>
          ))
        ) : (
          statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <button
              onClick={() => setActiveTab('applications')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
        </div>
        {applicationsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading applications...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.slice(0, 5).map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{application.name}</p>
                        <p className="text-sm text-gray-500">{application.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{application.course}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{application.submittedDate}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => viewApplicationDetails(application)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      {/* Loading state */}
      {applicationsLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading applications...</p>
        </div>
      )}

      {/* Filters and table */}
      {!applicationsLoading && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No applications found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentApplications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{application.name}</p>
                              <p className="text-sm text-gray-500">{application.email}</p>
                              <p className="text-sm text-gray-500">{application.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{application.course}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{application.academicScore}</td>
                          <td className="px-6 py-4">
                            <select
                              value={application.status}
                              onChange={(e) => {
                                const selectedStatus = e.target.value;
                                if (['pending', 'approved', 'rejected'].includes(selectedStatus)) {
                                  handleUpdateApplicationStatus(application.id.toString(), selectedStatus);
                                }
                              }}
                              className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getStatusColor(application.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{application.submittedDate}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => viewApplicationDetails(application)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleUpdateApplicationStatus(application.id.toString(), 'approved')}
                                className="text-green-600 hover:text-green-800"
                                title="Approve Application"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleUpdateApplicationStatus(application.id.toString(), 'rejected')}
                                className="text-red-600 hover:text-red-800"
                                title="Reject Application"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteApplication(application.id.toString())}
                                className="text-gray-600 hover:text-gray-800"
                                title="Delete Application"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredApplications.length > itemsPerPage && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <button 
          onClick={() => setShowAddCourseModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Loading state */}
      {coursesLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading courses...</p>
        </div>
      )}

      {/* Courses Grid */}
      {!coursesLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p>No courses found</p>
              <button 
                onClick={() => setShowAddCourseModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Course
              </button>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => {
                        setSelectedCourse(course);
                        // You can implement edit functionality here
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm font-medium text-gray-900">{course.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium text-gray-900">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fee:</span>
                    <span className="text-sm font-medium text-gray-900">₹{course.fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Seats:</span>
                    <span className="text-sm font-medium text-gray-900">{course.filledSeats}/{course.totalSeats}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Enrollment Progress</span>
                    <span>{Math.round((course.filledSeats / course.totalSeats) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(course.filledSeats / course.totalSeats) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => viewCourseDetails(course)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => openManageSeats(course)}
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Manage Seats
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'applications':
        return renderApplications();
      case 'courses':
        return renderCourses();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {getDisplayName(user)}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'courses', label: 'Courses', icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderTabContent()}

        {/* Modals */}
        {showApplicationModal && <ApplicationModal />}
        {showAddCourseModal && <AddCourseModal />}
        {showManageSeatsModal && <ManageSeatsModal />}
        {showCourseDetailsModal && <CourseDetailsModal />}
      </div>
    </div>
  );
};

export default AdminDashboard;