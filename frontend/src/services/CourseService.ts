// src/services/courseService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Course {
  id: string;
  name: string;
  fees: number;
  duration: string;
  eligibility: string;
  fees_link: string;
  brochure_link: string;
  brochure_name: string;
  apply_link: string;
  apply_name: string;
  category: string;
  level: string;
  rating: number;
  students: number;
  description: string;
  features: string[];
  totalSeats?: number;       
  availableSeats?: number;   
}

export interface BackendCourse {
  id: number;
  name: string;
  fees: number;
  duration: string;
  eligibility: string;
  fees_link: string;
  brochure_link: string;
  brochure_name: string;
  apply_link: string;
  apply_name: string;
  category?: string;
  level?: string;
  rating?: number;
  students?: number;
  description?: string;
  CourseDetails?: CourseDetail[];
  CourseSeats?: CourseSeat[];
}

interface CourseDetail {
  id: number;
  course_id: number;
  feature_name: string;
  feature_description: string;
}

interface CourseSeat {
  id: number;
  course_id: number;
  seat_type?: string;
  total_seats?: number;
  available_seats?: number;
}

class CourseService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[CourseService] API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private transformCourse(backendCourse: BackendCourse): Course {
    const features = Array.isArray(backendCourse.CourseDetails) && backendCourse.CourseDetails.length > 0
      ? backendCourse.CourseDetails.map(detail => detail.feature_name || 'Feature')
      : ['Expert Faculty', 'Hands-on Learning', 'Industry Connections', 'Career Support'];

    const totalSeats = backendCourse.CourseSeats?.reduce((sum, seat) => sum + (seat.total_seats || 0), 0);
    const availableSeats = backendCourse.CourseSeats?.reduce((sum, seat) => sum + (seat.available_seats || 0), 0);

    return {
      id: backendCourse.id.toString(),
      name: backendCourse.name,
      fees: backendCourse.fees,
      duration: backendCourse.duration,
      eligibility: backendCourse.eligibility,
      fees_link: backendCourse.fees_link,
      brochure_link: backendCourse.brochure_link,
      brochure_name: backendCourse.brochure_name,
      apply_link: backendCourse.apply_link,
      apply_name: backendCourse.apply_name,
      category: backendCourse.category || 'General',
      level: backendCourse.level || 'Undergraduate',
      rating: backendCourse.rating || 4.5,
      students: backendCourse.students || 100,
      description: backendCourse.description || `Learn about ${backendCourse.name} in our comprehensive program.`,
      features,
      totalSeats,
      availableSeats
    };
  }

  async getAllCourses(): Promise<Course[]> {
    const endpoints = ['/course-details/course_details_seats', '/courses'];

    for (const endpoint of endpoints) {
      try {
        const backendCourses: BackendCourse[] = await this.request(endpoint);
        if (Array.isArray(backendCourses)) {
          return backendCourses.map(course => this.transformCourse(course));
        }
      } catch (error) {
        console.warn(`[CourseService] Failed endpoint ${endpoint}:`, error);
      }
    }

    console.error('[CourseService] All endpoints failed.');
    return []; // Return empty array instead of throwing, frontend can handle empty data
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const backendCourse: BackendCourse = await this.request(`/courses/${id}`);
      return this.transformCourse(backendCourse);
    } catch (error) {
      console.error(`[CourseService] getCourseById failed for id ${id}:`, error);
      return null;
    }
  }

  async searchCourses(filters: {
    searchTerm?: string;
    category?: string;
    level?: string;
    priceRange?: string;
  }): Promise<Course[]> {
    const allCourses = await this.getAllCourses();

    return allCourses.filter(course => {
      const matchesSearch = !filters.searchTerm || 
        course.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesCategory = !filters.category || filters.category === 'All' || 
        course.category === filters.category;
      
      const matchesLevel = !filters.level || filters.level === 'All' || 
        course.level === filters.level;
      
      const matchesPrice = !filters.priceRange || filters.priceRange === 'All' ||
        (filters.priceRange === 'Under ₹15,000' && course.fees < 15000) ||
        (filters.priceRange === '₹15,000 - ₹20,000' && course.fees >= 15000 && course.fees <= 20000) ||
        (filters.priceRange === 'Above ₹20,000' && course.fees > 20000);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });
  }
}

export const courseService = new CourseService();
