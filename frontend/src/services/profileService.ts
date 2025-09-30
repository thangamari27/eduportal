// services/profileService.ts - COMPLETELY FIXED
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Unified Profile interface
interface Profile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  student_id?: string; // Optional for students
}

class ProfileService {
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
      return {
        success: false,
        error: 'Failed to parse response'
      };
    }
  }

  // SINGLE method to get profile (handles user/admin internally)
  async getProfile(): Promise<ApiResponse<Profile>> {
    try {
      const endpoint = this.isAdmin() ? '/users/admin/profile' : '/users/profile';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      const result = await this.handleResponse<Profile>(response);
      
      // Transform the response data to match our unified Profile interface
      if (result.success && result.data) {
        // Handle different response structures
        const profileData = (result.data as any).profileData || 
                           (result.data as any).user?.profileData || 
                           (result.data as any).admin?.profileData || 
                           result.data;
        
        return {
          success: true,
          data: this.transformToProfile(profileData),
          message: result.message
        };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: 'Network error fetching profile' };
    }
  }

  // SINGLE method to update profile
  async updateProfile(profileData: Partial<Profile>): Promise<ApiResponse<Profile>> {
    try {
      const endpoint = this.isAdmin() ? '/users/admin/profile' : '/users/profile';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ profileData })
      });
      
      const result = await this.handleResponse<Profile>(response);
      
      // Transform response if needed
      if (result.success && result.data) {
        const transformedData = this.transformToProfile(result.data);
        return {
          success: true,
          data: transformedData,
          message: result.message
        };
      }
      
      return result;
    } catch (error) {
      return { success: false, error: 'Network error updating profile' };
    }
  }

  // Password Management
  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });
      
      return this.handleResponse(response);
    } catch (error) {
      return { success: false, error: 'Network error changing password' };
    }
  }

  // Utility Methods
 isAuthenticated(): boolean {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  return !!(token && userType); // Both token AND userType must exist
}

  isAdmin(): boolean {
    const userType = localStorage.getItem('userType');
    return userType === 'admin';
  }

  // Private helper to transform data to unified Profile format
  private transformToProfile(data: any): Profile {
    return {
      id: data.id || 0,
      email: data.email || '',
      first_name: data.first_name || data.firstName || '',
      last_name: data.last_name || data.lastName || '',
      phone_number: data.phone_number || data.phone_no || data.phone || '',
      date_of_birth: data.date_of_birth || data.dob || null,
      gender: data.gender || '',
      address: data.address || '',
      student_id: data.student_id || data.studentId
    };
  }

  // REMOVED: All redundant methods like:
  // getUserProfile(), getAdminProfile(), getUserProfileData(), getAdminProfileData()
  // getCurrentProfileData(), updateCurrentProfileData()
}

// Export singleton instance
export const profileService = new ProfileService();

// Export types for use in components
export type {
  ApiResponse,
  Profile
};