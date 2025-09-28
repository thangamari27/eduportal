// src/types/applicationForm.ts
export interface SubjectMark {
  id: number;
  subject: string;
  mark: string;
}

export interface ApplicationFormData {
  // Personal Information (snake_case for consistency)
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  aadhaar_number: string;
  blood_group: string;
  date_of_birth: string;
  gender: string;
  address: string;
  father_name: string;
  father_occupation: string;
  mother_name: string;
  mother_occupation: string;
  annual_income: string;
  community: string;
  caste: string;
  religion: string;
  nationality: string;
  
  // Academic Information
  school_name: string;
  exam_register_number: string;
  emis_no: string;
  subjects: SubjectMark[]; // ✅ Changed from subjectMarks to subjects
  total_marks: string;
  mark_percentage: string;
  cutoff_marks: string; // ✅ Changed from cutoff to cutoff_marks
  month_year_passing: string;
  
  // Course Information (part of academic info in database)
  course_type: string;
  course_name: string;
  course_mode: string;
  
  // Extra Information
  physically_challenged: string;
  ex_serviceman: string;
  activities: string;
  
  // Files (consistent naming)
  passport_photo: File | null;
  aadhaar_card: File | null;
  transfer_certificate: File | null;
}

export interface ApplicationState {
  currentStep: number;
  formData: ApplicationFormData;
  isLoading: boolean;
  error: string | null;
  submissionStatus: 'idle' | 'submitting' | 'success' | 'error';
}

// Keep existing interfaces for backend/database
export interface PersonalInfo {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  aadhaar_number: string;
  blood_group?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  father_name?: string;
  father_occupation?: string;
  mother_name?: string;
  mother_occupation?: string;
  annual_income?: number;
  community?: string;
  caste?: string;
  religion?: string;
  nationality?: string;
}

export interface AcademicInfo {
  academic_id: string;
  student_id: string;
  school_name?: string;
  exam_register_number?: string;
  emis_no?: string;
  subjects?: SubjectMark[];
  total_marks?: number;
  mark_percentage?: number;
  cutoff_marks?: number;
  month_year_passing?: string;
  course_type?: string;
  course_name?: string;
  course_mode?: string;
  passport_photo?: string;
  aadhaar_card?: string;
  transfer_certificate?: string;
}

export interface ExtraInfo {
  student_id: string;
  physically_challenged?: string;
  ex_serviceman?: string;
  activities?: string;
}

export interface AdmissionRecord {
  id: number;
  admission_id: string;
  student_id: string;
  email: string;
  admission_timestamp: string;
  application_status: 'Pending' | 'Approved' | 'Rejected';
}