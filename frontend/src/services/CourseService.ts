// src/services/courseService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Course {
  id: string;
  name: string;
  fees: number;
  duration: string;
  eligibility: string;
  fees_link: string | null;
  brochure_link: string | null;
  brochure_name: string | null;
  apply_link: string | null;
  apply_name: string | null;
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
  fees: number | string;
  duration: string;
  eligibility: string;
  fees_link: string | null;
  brochure_link: string | null;
  brochure_name: string | null;
  apply_link: string | null;
  apply_name: string | null;
  description?: string;
  category?: string;
  level?: string;
  rating?: number;
  students?: number;
  courseDetails?: CourseDetail[];
  courseSeats?: CourseSeat[];
}

interface CourseDetail {
  id: number;
  program: string;
  fees: number | string;
  eligibility: string;
}

interface CourseSeat {
  id: number;
  seats: number;
}

class CourseService {
  private async request(endpoint: string, options: RequestInit = {}, requiresAuth: boolean = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = requiresAuth ? localStorage.getItem('authToken') || sessionStorage.getItem('authToken') : null;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && requiresAuth ? { 'Authorization': `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      if (response.status === 401 && requiresAuth) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        throw new Error('Authentication required');
      }

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
    const features = Array.isArray(backendCourse.courseDetails) && backendCourse.courseDetails.length > 0
      ? backendCourse.courseDetails.map(d => d.program || 'Program')
      : ['Expert Faculty', 'Hands-on Learning', 'Industry Connections', 'Career Support'];

    const totalSeats = backendCourse.courseSeats?.reduce((sum, seat) => sum + (seat.seats || 0), 0);
    const availableSeats = totalSeats; // backend not sending available, so assume all seats available

    return {
      id: backendCourse.id.toString(),
      name: backendCourse.name,
      fees: Number(backendCourse.fees),
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
      availableSeats,
    };
  }

  // Public - no auth required
  async getAllCourses(): Promise<Course[]> {
    try {
      const data = await this.request('/courses', {}, false);

      if (Array.isArray(data)) {
        return data.map(course => this.transformCourse(course));
      } else if (data && Array.isArray(data.courses)) {
        return data.courses.map((course: BackendCourse) => this.transformCourse(course));
      }

      throw new Error('No courses available from server');
    } catch (error) {
      console.error('[CourseService] getAllCourses failed:', error);
      return [];
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const data = await this.request(`/courses/${id}`, {}, false);
      if (data && data.course) {
        return this.transformCourse(data.course);
      }
      return this.transformCourse(data);
    } catch (error) {
      console.error(`[CourseService] getCourseById failed for id ${id}:`, error);
      return null;
    }
  }

  // Admin - auth required
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const data = await this.request('/courses/admin/course', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }, true);
    return this.transformCourse(data);
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    const data = await this.request(`/courses/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }, true);
    return this.transformCourse(data);
  }

  async deleteCourse(id: string): Promise<void> {
    await this.request(`/courses/admin/${id}`, { method: 'DELETE' }, true);
  }
}

export const courseService = new CourseService();
