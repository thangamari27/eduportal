// services/admissionService.ts - COMPLETELY FIXED
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface AdmissionStatus {
  admission_id: string;
  application_status: 'Pending' | 'Approved' | 'Rejected';
  admission_timestamp: string;
  applied_time: string;
  student_name: string;
  course_name: string;
}

interface AdmissionRecord {
  admission_id: string;
  student_id: string;
  email: string;
  application_status: string;
  admission_timestamp: string;
  personalInfo?: any;
  academicInfo?: any;
  extraInfo?: any;
}

class AdmissionService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      if (response.ok) {
        return {
          success: true,
          data: data.data || data,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return { success: false, error: 'Failed to parse response' };
    }
  }

  // Dashboard statistics
  async getAdmissionStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admissions/student-dashboard/statistics`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Network error fetching statistics' };
    }
  }

  // User: single application status
  async getUserApplicationStatus(): Promise<ApiResponse<AdmissionStatus>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admissions/application/status`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse<AdmissionStatus>(response);
    } catch (error) {
      return { success: false, error: 'Network error fetching application status' };
    }
  }

  // User: all applications (if system supports multiple)
  async getUserApplications(): Promise<ApiResponse<AdmissionRecord[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admissions/application`, {
        headers: this.getAuthHeaders()
      });
      return this.handleResponse<AdmissionRecord[]>(response);
    } catch (error) {
      return { success: false, error: 'Network error fetching applications' };
    }
  }

}

// Export singleton
export const admissionService = new AdmissionService();

// Export types
export type {
  ApiResponse,
  AdmissionStatus,
  AdmissionRecord
};
