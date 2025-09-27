// src/services/apiService.ts
import { PersonalInfo, AcademicInfo, ExtraInfo, AdmissionRecord } from '../../src/types/admissionFormTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

// Enhance your apiService.ts for better error responses
private async handleResponse(response: Response) {
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    if (response.status !== 204) {
      return { success: false, error: 'Network error or invalid response' };
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `HTTP error! status: ${response.status}`);
  }

  return { success: true, ...data };
}

// Update API methods to return consistent response format
async savePersonalInfo(data: Partial<PersonalInfo>) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/personal-info`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return await this.handleResponse(response);
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

 async saveAcademicInfo(data: Partial<AcademicInfo>) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/academic-info`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return await this.handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

async saveExtraInfo(data: Partial<ExtraInfo>) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/extra-info`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return await this.handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}


  async getProfile() {
    const headers: HeadersInit = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE_URL}/users/profile`, { headers });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }


  // Admission Application API calls
  async submitAdmissionApplication() {
    const response = await fetch(`${API_BASE_URL}/admissions/apply`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAdmissionStatus(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/admissions/status/${studentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getApplicationDetails(studentId: string) {
    const response = await fetch(`${API_BASE_URL}/admissions/application/${studentId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();