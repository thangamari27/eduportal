// src/contexts/ApplicationContext.tsx
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { ApplicationFormData, ApplicationState, SubjectMark } from '../../src/types/admissionFormTypes';
import { apiService } from '../../src/services/admissionFormService';
import { applicationReducer } from '../reducers/applicationReducer';

interface ApplicationContextType extends ApplicationState {
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<ApplicationFormData>) => void;
  addSubjectMark: () => void;
  updateSubjectMark: (id: number, field: 'subject' | 'mark', value: string) => void;
  removeSubjectMark: (id: number) => void;
  saveDraft: () => void;
  loadDraft: () => void;
  submitApplication: () => Promise<boolean>;
  resetApplication: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

const initialState: ApplicationState = {
  currentStep: 1,
  formData: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    bloodGroup: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    annualIncome: '',
    community: '',
    caste: '',
    religion: '',
    nationality: 'Indian',
    schoolName: '',
    examRegisterNumber: '',
    emisNo: '',
    subjectMarks: [{ id: 1, subject: '', mark: '' }],
    totalMarks: '',
    markPercentage: '',
    cutoff: '',
    monthYearPassing: '',
    courseType: '',
    courseName: '',
    courseMode: '',
    physicallyChallenged: '',
    exServiceman: '',
    activities: '',
    photo: null,
    aadhaarCard: null,
    transferCertificate: null,
  },
  isLoading: false,
  error: null,
  submissionStatus: 'idle',
};

interface ApplicationProviderProps {
  children: ReactNode;
  token?: string;
}

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ 
  children, 
  token 
}) => {
  const [state, dispatch] = useReducer(applicationReducer, initialState);

  // Set token when provider mounts or token changes
  React.useEffect(() => {
  const t = token ?? localStorage.getItem('token');
  if (t) apiService.setToken(t);
}, [token]);

  // Memoize all functions to prevent unnecessary re-renders
  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const updateFormData = useCallback((data: Partial<ApplicationFormData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: data });
  }, []);

  const addSubjectMark = useCallback(() => {
    const newSubjectMark: SubjectMark = {
      id: Date.now(),
      subject: '',
      mark: '',
    };
    dispatch({ type: 'ADD_SUBJECT_MARK', payload: newSubjectMark });
  }, []);

  const updateSubjectMark = useCallback((id: number, field: 'subject' | 'mark', value: string) => {
    dispatch({ 
      type: 'UPDATE_SUBJECT_MARK', 
      payload: { id, field, value } 
    });
  }, []);

  const removeSubjectMark = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_SUBJECT_MARK', payload: id });
  }, []);

  const saveDraft = useCallback(() => {
    dispatch({ type: 'SAVE_DRAFT' });
  }, []);

  const loadDraft = useCallback(() => {
    dispatch({ type: 'LOAD_DRAFT' });
  }, []);

 // Update the submitApplication function in ApplicationContext.tsx
const submitApplication = useCallback(async (): Promise<boolean> => {
  dispatch({ type: 'SUBMIT_APPLICATION_START' });
  
  try {
    // Validate required fields before submission
    if (!state.formData.aadhaarNumber || !state.formData.email) {
      throw new Error('Required fields are missing');
    }

    // Transform form data to match backend models
    const personalInfoData = {
      first_name: state.formData.firstName,
      last_name: state.formData.lastName,
      email: state.formData.email,
      phone_number: state.formData.phone,
      aadhaar_number: state.formData.aadhaarNumber,
      blood_group: state.formData.bloodGroup,
      date_of_birth: state.formData.dateOfBirth,
      gender: state.formData.gender,
      address: state.formData.address,
      father_name: state.formData.fatherName,
      father_occupation: state.formData.fatherOccupation,
      mother_name: state.formData.motherName,
      mother_occupation: state.formData.motherOccupation,
      annual_income: state.formData.annualIncome ? parseFloat(state.formData.annualIncome) : undefined,
      community: state.formData.community,
      caste: state.formData.caste,
      religion: state.formData.religion,
      nationality: state.formData.nationality,
    };

    const academicInfoData = {
      school_name: state.formData.schoolName,
      exam_register_number: state.formData.examRegisterNumber,
      emis_no: state.formData.emisNo,
      subjects: state.formData.subjectMarks,
      total_marks: state.formData.totalMarks ? parseInt(state.formData.totalMarks) : undefined,
      mark_percentage: state.formData.markPercentage ? parseFloat(state.formData.markPercentage) : undefined,
      cutoff_marks: state.formData.cutoff ? parseFloat(state.formData.cutoff) : undefined,
      month_year_passing: state.formData.monthYearPassing,
      course_type: state.formData.courseType,
      course_name: state.formData.courseName,
      course_mode: state.formData.courseMode,
    };

    const extraInfoData = {
      physically_challenged: state.formData.physicallyChallenged,
      ex_serviceman: state.formData.exServiceman,
      activities: state.formData.activities,
    };

    // Save data to backend in sequence with error handling
    const personalResponse = await apiService.savePersonalInfo(personalInfoData);
    if (!personalResponse.success) {
      throw new Error(personalResponse.error || 'Failed to save personal information');
    }

    const academicResponse = await apiService.saveAcademicInfo(academicInfoData);
    if (!academicResponse.success) {
      throw new Error(academicResponse.error || 'Failed to save academic information');
    }

    const extraResponse = await apiService.saveExtraInfo(extraInfoData);
    if (!extraResponse.success) {
      throw new Error(extraResponse.error || 'Failed to save extra information');
    }

    const admissionResponse = await apiService.submitAdmissionApplication();

    if (!admissionResponse.success) {
      throw new Error(admissionResponse.error || 'Failed to submit admission application');
    }

     dispatch({ type: 'SUBMIT_APPLICATION_SUCCESS' });
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Submission failed due to an unexpected error';
    
    dispatch({ type: 'SUBMIT_APPLICATION_ERROR', payload: errorMessage });
    console.error('Application submission error:', error);
    return false;
  }
}, [state.formData]);

  const resetApplication = useCallback(() => {
    dispatch({ type: 'RESET_APPLICATION' });
  }, []);

  const value: ApplicationContextType = {
    ...state,
    setCurrentStep,
    updateFormData,
    addSubjectMark,
    updateSubjectMark,
    removeSubjectMark,
    saveDraft,
    loadDraft,
    submitApplication,
    resetApplication,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplication = (): ApplicationContextType => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};