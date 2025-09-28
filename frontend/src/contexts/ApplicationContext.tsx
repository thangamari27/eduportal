import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ApplicationFormData, SubjectMark } from '../types/applicationForm';
import { admissionService } from '../services/admissionFormService';

// Define the context type
export interface ApplicationContextType {
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  formData: ApplicationFormData;
  isLoading: boolean;
  error: string | null;
  submissionStatus: string;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  addSubjectMark: () => void;
  updateSubjectMark: (id: number, field: 'subject' | 'mark', value: string) => void;
  removeSubjectMark: (id: number) => void;
  saveDraft: () => void;
  loadDraft: () => void;
  submitApplication: () => Promise<any>;
}

// Provide default value
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

interface ApplicationProviderProps {
  children: ReactNode;
  user?: any; 
  token?: String;
}

export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children, user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState('idle');

  // Initialize form data with proper types - USING SNAKE_CASE FOR CONSISTENCY
  const [formData, setFormData] = useState<ApplicationFormData>({
    // Personal Information (snake_case to match database)
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    aadhaar_number: '',
    blood_group: '',
    date_of_birth: '',
    gender: '',
    address: '',
    father_name: '',
    father_occupation: '',
    mother_name: '',
    mother_occupation: '',
    annual_income: '',
    community: '',
    caste: '',
    religion: '',
    nationality: 'Indian', // Default value
    
    // Academic Information
    school_name: '',
    exam_register_number: '',
    emis_no: '',
    subjects: [{ id: 1, subject: '', mark: '' }], // Changed from subjectMarks to subjects
    total_marks: '',
    mark_percentage: '',
    cutoff_marks: '',
    month_year_passing: '',
    
    // Course Information (moved to academic section to match database)
    course_type: '',
    course_name: '',
    course_mode: '',
    
    // Extra Information
    physically_challenged: '',
    ex_serviceman: '',
    activities: '',
    
    // Files (consistent naming)
    passport_photo: null,
    aadhaar_card: null,
    transfer_certificate: null
  });

  // ✅ FIXED: Correct transformation to backend format
  const transformToBackendFormat = useCallback((frontendData: ApplicationFormData) => {
    return {
      personalInfo: {
        first_name: frontendData.first_name,
        last_name: frontendData.last_name,
        email: frontendData.email,
        phone_number: frontendData.phone_number, // Fixed mapping
        aadhaar_number: frontendData.aadhaar_number,
        blood_group: frontendData.blood_group,
        date_of_birth: frontendData.date_of_birth,
        gender: frontendData.gender,
        address: frontendData.address,
        father_name: frontendData.father_name,
        father_occupation: frontendData.father_occupation,
        mother_name: frontendData.mother_name,
        mother_occupation: frontendData.mother_occupation,
        annual_income: frontendData.annual_income,
        community: frontendData.community,
        caste: frontendData.caste,
        religion: frontendData.religion,
        nationality: frontendData.nationality
      },
      academicInfo: {
        school_name: frontendData.school_name,
        exam_register_number: frontendData.exam_register_number,
        emis_no: frontendData.emis_no,
        subjects: frontendData.subjects, // ✅ Correct property name
        total_marks: frontendData.total_marks,
        mark_percentage: frontendData.mark_percentage,
        cutoff_marks: frontendData.cutoff_marks, // ✅ Correct property name
        month_year_passing: frontendData.month_year_passing,
        course_type: frontendData.course_type, // ✅ Moved to correct section
        course_name: frontendData.course_name,  // ✅ Moved to correct section
        course_mode: frontendData.course_mode   // ✅ Moved to correct section
      },
      extraInfo: {
        physically_challenged: frontendData.physically_challenged,
        ex_serviceman: frontendData.ex_serviceman,
        activities: frontendData.activities
      }
    };
  }, []);

  // ✅ FIXED: Correct transformation from backend format
  const transformToFrontendFormat = useCallback((backendData: any): ApplicationFormData => {
    const personalInfo = backendData.personalInfo || {};
    const academicInfo = backendData.academicInfo || {};
    const extraInfo = backendData.extraInfo || {};
    
    return {
      // Personal Information
      first_name: personalInfo.first_name || '',
      last_name: personalInfo.last_name || '',
      email: personalInfo.email || '',
      phone_number: personalInfo.phone_number || '',
      aadhaar_number: personalInfo.aadhaar_number || '',
      blood_group: personalInfo.blood_group || '',
      date_of_birth: personalInfo.date_of_birth || '',
      gender: personalInfo.gender || '',
      address: personalInfo.address || '',
      father_name: personalInfo.father_name || '',
      father_occupation: personalInfo.father_occupation || '',
      mother_name: personalInfo.mother_name || '',
      mother_occupation: personalInfo.mother_occupation || '',
      annual_income: personalInfo.annual_income || '',
      community: personalInfo.community || '',
      caste: personalInfo.caste || '',
      religion: personalInfo.religion || '',
      nationality: personalInfo.nationality || 'Indian',
      
      // Academic Information
      school_name: academicInfo.school_name || '',
      exam_register_number: academicInfo.exam_register_number || '',
      emis_no: academicInfo.emis_no || '',
      subjects: academicInfo.subjects || [{ id: 1, subject: '', mark: '' }], // ✅ Correct property
      total_marks: academicInfo.total_marks || '',
      mark_percentage: academicInfo.mark_percentage || '',
      cutoff_marks: academicInfo.cutoff_marks || '', // ✅ Correct property
      month_year_passing: academicInfo.month_year_passing || '',
      
      // Course Information
      course_type: academicInfo.course_type || '', // ✅ From correct section
      course_name: academicInfo.course_name || '',  // ✅ From correct section
      course_mode: academicInfo.course_mode || '',   // ✅ From correct section
      
      // Extra Information
      physically_challenged: extraInfo.physically_challenged || '',
      ex_serviceman: extraInfo.ex_serviceman || '',
      activities: extraInfo.activities || '',
      
      // Files
      passport_photo: null,
      aadhaar_card: null,
      transfer_certificate: null
    };
  }, []);

  // Submit application to backend
  const submitApplication = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📝 Form Data before transformation:', formData);
      
      const backendData = transformToBackendFormat(formData);
      console.log('🔄 Transformed Data for backend:', backendData);
      
      const response = await admissionService.submitApplication(backendData);
      
      console.log('✅ Submission successful:', response);
      
      setSubmissionStatus('submitted');
      return response;
    } catch (err) {
      console.error('Error submitting application:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [formData, transformToBackendFormat]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<ApplicationFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // ✅ FIXED: Subject marks operations - using correct property name
  const addSubjectMark = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      subjects: [ // ✅ Changed from subjectMarks to subjects
        ...prev.subjects,
        { id: Date.now(), subject: '', mark: '' }
      ]
    }));
  }, []);

  const updateSubjectMark = useCallback((id: number, field: 'subject' | 'mark', value: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(item => // ✅ Changed from subjectMarks to subjects
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const removeSubjectMark = useCallback((id: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(item => item.id !== id) // ✅ Changed from subjectMarks to subjects
    }));
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem('admissionDraft', JSON.stringify(formData));
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  }, [formData]);

  // Load draft from localStorage
  const loadDraft = useCallback(() => {
    try {
      const draft = localStorage.getItem('admissionDraft');
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setFormData(prev => ({
          ...prev,
          ...parsedDraft,
          // Ensure files are null when loading from localStorage
          passport_photo: null,
          aadhaar_card: null,
          transfer_certificate: null
        }));
      }
    } catch (err) {
      console.error('Error loading draft:', err);
    }
  }, []);

  const value: ApplicationContextType = {
    currentStep,
    setCurrentStep,
    formData,
    isLoading,
    error,
    submissionStatus,
    updateFormData,
    addSubjectMark,
    updateSubjectMark,
    removeSubjectMark,
    saveDraft,
    loadDraft,
    submitApplication
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};