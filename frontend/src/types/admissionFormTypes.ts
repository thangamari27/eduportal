// src/types/index.ts
export interface SubjectMark {
  id: number;
  subject: string;
  mark: string;
}

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
  passport_photo?: string; // Base64 or file path
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

export interface ApplicationFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  bloodGroup: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  annualIncome: string;
  community: string;
  caste: string;
  religion: string;
  nationality: string;
  
  // Academic Information
  schoolName: string;
  examRegisterNumber: string;
  emisNo: string;
  subjectMarks: SubjectMark[];
  totalMarks: string;
  markPercentage: string;
  cutoff: string;
  monthYearPassing: string;
  
  // Course Information
  courseType: string;
  courseName: string;
  courseMode: string;
  
  // Extra Information
  physicallyChallenged: string;
  exServiceman: string;
  activities: string;
  
  // Files
  photo: File | null;
  aadhaarCard: File | null;
  transferCertificate: File | null;
}

export interface ApplicationState {
  currentStep: number;
  formData: ApplicationFormData;
  isLoading: boolean;
  error: string | null;
  submissionStatus: 'idle' | 'submitting' | 'success' | 'error';
}