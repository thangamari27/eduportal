import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApplicationData {
  personalInfo: any;
  academicInfo: any;
  extraInfo: any;
}

export const admissionService = {
  // Submit complete application
  submitApplication: async (applicationData: ApplicationData) => {
    const response = await api.post('/admissions/submit', applicationData);
    return response.data;
  },

  // Individual component operations
  getPersonalInfo: async () => {
    const response = await api.get('/admissions/personal-info');
    return response.data;
  },

  updatePersonalInfo: async (data: any) => {
    const response = await api.put('/admissions/personal-info', data);
    return response.data;
  },

  getAcademicInfo: async () => {
    const response = await api.get('/admissions/academic-info');
    return response.data;
  },

  updateAcademicInfo: async (data: any) => {
    const response = await api.put('/admissions/academic-info', data);
    return response.data;
  },

  getExtraInfo: async () => {
    const response = await api.get('/admissions/extra-info');
    return response.data;
  },

  updateExtraInfo: async (data: any) => {
    const response = await api.put('/admissions/extra-info', data);
    return response.data;
  },

  getAdmissionRecord: async () => {
    const response = await api.get('/admissions/admission-record');
    return response.data;
  },

  // File upload helper
  uploadFile: async (file: File, fieldName: string) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const response = await api.post('/admissions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};