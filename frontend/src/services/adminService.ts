import { ApiService } from './UserApiService';

export interface AdminStats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
}

export interface Application {
  admission_id: string;
  student_id: string;
  email: string;
  application_status: 'Pending' | 'Approved' | 'Rejected';
  admission_timestamp: string;
  personalInfo?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  academicInfo?: {
    course_name: string;
    academic_id: string;
  };
}

export interface Course {
  id: number;
  name: string;
  fees: number;
  duration?: string;
  eligibility?: string;
  fees_link?: string;
  brochure_link?: string;
  brochure_name?: string;
  apply_link?: string;
  apply_name?: string;
  courseDetails?: CourseDetail[];
  courseSeats?: CourseSeat[];
}

export interface CourseDetail {
  id: number;
  course_id: number;
  program: string;
  fees: number;
  eligibility?: string;
}

export interface CourseSeat {
  id: number;
  course_id: number;
  seats: number;
}

export interface User {
  id: string;
  email: string;
  phone_no: string;
  student_id?: string;
  created_at: string;
  personalInfo?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

class AdminService extends ApiService {
  // ✅ ADDED: Token validation helper
  private validateAdminAccess(): void {
    const token = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    if (userType !== 'admin') {
      throw new Error('Admin access required');
    }
  }

  // Admission Statistics
  async getAdmissionStatistics(): Promise<AdminStats> {
    this.validateAdminAccess();
    
   
    return this.request('/admissions/admin-dashboard/statistics', {
      method: 'GET',
      headers: this.getAuthHeader(),
    });
  }

  // Applications Management
  async getAllApplications(): Promise<{ applications: Application[] }> {
    this.validateAdminAccess();
    
   
    return this.request('/admissions/admin/applications', {
      method: 'GET',
      headers: this.getAuthHeader(),
    });
  }

  async updateApplicationStatus(
    admissionId: string,
    status: 'Pending' | 'Approved' | 'Rejected'
  ): Promise<any> {
    this.validateAdminAccess();
    
   
    return this.request(`/admissions/admin/application/${admissionId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ status }),
    });
  }

  // Users Management
  async getAllUsers(): Promise<{ users: User[]; count: number }> {
    this.validateAdminAccess();
    
    return this.request('/users/admin/users', {
      method: 'GET',
      headers: this.getAuthHeader(),
    });
  }

  // Courses Management
  async getAllCourses(): Promise<{ courses: Course[]; count: number }> {
    this.validateAdminAccess();
    return this.request('/courses/admin/all', {
      method: 'GET',
      headers: this.getAuthHeader(),
    });
  }

  async createCourse(courseData: Partial<Course>): Promise<{ course: Course }> {
    this.validateAdminAccess();
    
    return this.request('/courses/admin/course', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<{ course: Course }> {
    this.validateAdminAccess();
    
    return this.request(`/courses/admin/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: number): Promise<void> {
    this.validateAdminAccess();
    
    return this.request(`/courses/admin/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
  }

  // Course Details Management
  async addCourseDetail(detailData: Omit<CourseDetail, 'id'>): Promise<{ courseDetail: CourseDetail }> {
    this.validateAdminAccess();
    
    return this.request('/courses/admin/details', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(detailData),
    });
  }

  async updateCourseDetail(id: number, detailData: Partial<CourseDetail>): Promise<{ courseDetail: CourseDetail }> {
    this.validateAdminAccess();
    
    return this.request(`/courses/admin/details/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify(detailData),
    });
  }

  async deleteCourseDetail(id: number): Promise<void> {
    this.validateAdminAccess();
    
    return this.request(`/courses/admin/details/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
  }

  // Course Seats Management
  async addCourseSeat(seatData: Omit<CourseSeat, 'id'>): Promise<{ courseSeat: CourseSeat }> {
    this.validateAdminAccess();
    
    return this.request('/courses/admin/seats', {
      method: 'POST',
      headers: this.getAuthHeader(),
      body: JSON.stringify(seatData),
    });
  }

  async updateCourseSeat(id: number, seats: number): Promise<{ courseSeat: CourseSeat }> {
    this.validateAdminAccess();
    
    return this.request(`/courses/admin/seats/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeader(),
      body: JSON.stringify({ seats }),
    });
  }

  async deleteCourseSeat(id: number): Promise<void> {
    this.validateAdminAccess();
    
    return this.request(`/courses/admin/seats/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });
  }
}

export const adminService = new AdminService();