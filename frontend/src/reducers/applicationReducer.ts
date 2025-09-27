// src/reducers/applicationReducer.ts
import { ApplicationState, ApplicationFormData, SubjectMark } from '../../src/types/admissionFormTypes';

type ApplicationAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<ApplicationFormData> }
  | { type: 'ADD_SUBJECT_MARK'; payload: SubjectMark }
  | { type: 'UPDATE_SUBJECT_MARK'; payload: { id: number; field: 'subject' | 'mark'; value: string } }
  | { type: 'REMOVE_SUBJECT_MARK'; payload: number }
  | { type: 'SAVE_DRAFT' }
  | { type: 'LOAD_DRAFT' }
  | { type: 'SUBMIT_APPLICATION_START' }
  | { type: 'SUBMIT_APPLICATION_SUCCESS' }
  | { type: 'SUBMIT_APPLICATION_ERROR'; payload: string }
  | { type: 'RESET_APPLICATION' };

export const applicationReducer = (state: ApplicationState, action: ApplicationAction): ApplicationState => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };

    case 'ADD_SUBJECT_MARK':
      return {
        ...state,
        formData: {
          ...state.formData,
          subjectMarks: [...state.formData.subjectMarks, action.payload],
        },
      };

    case 'UPDATE_SUBJECT_MARK':
      return {
        ...state,
        formData: {
          ...state.formData,
          subjectMarks: state.formData.subjectMarks.map(mark =>
            mark.id === action.payload.id
              ? { ...mark, [action.payload.field]: action.payload.value }
              : mark
          ),
        },
      };

    case 'REMOVE_SUBJECT_MARK':
      return {
        ...state,
        formData: {
          ...state.formData,
          subjectMarks: state.formData.subjectMarks.filter(mark => mark.id !== action.payload),
        },
      };

    case 'SAVE_DRAFT':
      localStorage.setItem('applicationDraft', JSON.stringify(state.formData));
      return state;

    case 'LOAD_DRAFT':
      const draft = localStorage.getItem('applicationDraft');
      if (draft) {
        return {
          ...state,
          formData: JSON.parse(draft),
        };
      }
      return state;

    case 'SUBMIT_APPLICATION_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        submissionStatus: 'submitting',
      };

    case 'SUBMIT_APPLICATION_SUCCESS':
      // Clear draft after successful submission
      localStorage.removeItem('applicationDraft');
      return {
        ...state,
        isLoading: false,
        submissionStatus: 'success',
      };

    case 'SUBMIT_APPLICATION_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        submissionStatus: 'error',
      };

    case 'RESET_APPLICATION':
      localStorage.removeItem('applicationDraft');
      return {
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

    default:
      return state;
  }
};