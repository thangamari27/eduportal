import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  User, 
  GraduationCap, 
  BookOpen, 
  FileText,
  Save,
  Eye,
  Plus,
  Trash2,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useApplication } from '../contexts/ApplicationContext';
import { SubjectMark } from '../types/applicationForm';

interface ApplicationFormProps {
  user: any;
  onNavigate: (page: string) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ user, onNavigate }) => {
  const {
    currentStep,
    formData,
    isLoading,
    error: contextError,
    submissionStatus,
    setCurrentStep,
    updateFormData,
    addSubjectMark,
    updateSubjectMark,
    removeSubjectMark,
    saveDraft,
    submitApplication,
    loadDraft,
  } = useApplication();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [isConfirmChecked, setIsConfirmChecked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const totalSteps = 4;

  const steps = [
    { number: 1, title: 'Personal Information', icon: User },
    { number: 2, title: 'Academic History', icon: GraduationCap },
    { number: 3, title: 'Course Selection', icon: BookOpen },
    { number: 4, title: 'Review & Submit', icon: FileText }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const communities = ['General', 'MBC', 'OC', 'BC', 'SC', 'SCA', 'ST', 'Other'];
  const religions = ['Hindu', 'Muslim', 'Christian', 'Other'];
  const courseTypes = ['UG', 'PG'];
  const activities = ['Sports', 'NSS', 'NCC', 'Other'];

  // Load draft and user email on component mount
  useEffect(() => {
    if (!isInitialized) {
      loadDraft();
      setIsInitialized(true);
    }
  }, [isInitialized, loadDraft]);

  // Separate useEffect for user email initialization
  useEffect(() => {
    if (user?.email && !formData.email) {
      updateFormData({ email: user.email });
    }
  }, [user, formData.email, updateFormData]);

  const getCourseOptions = (type: string) => {
    const ugCourses = [
      'B.Tech Computer Science',
      'B.Tech Information Technology',
      'B.Tech Electronics',
      'B.Tech Mechanical',
      'B.Sc Computer Science',
      'B.Sc Mathematics',
      'B.Com',
      'BBA'
    ];
    
    const pgCourses = [
      'M.Tech Computer Science',
      'M.Tech Information Technology',
      'M.Sc Computer Science',
      'M.Sc Mathematics',
      'M.Com',
      'MBA'
    ];
    
    return type === 'UG' ? ugCourses : pgCourses;
  };

  const getCourseModes = (course: string) => {
    if (course.includes('B.Tech') || course.includes('M.Tech')) {
      return ['Regular', 'Part-time'];
    }
    return ['Regular', 'Correspondence', 'Distance'];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    updateFormData({ [fieldName]: file });
  };

  const handleSubjectChange = (id: number, field: 'subject' | 'mark', value: string) => {
    updateSubjectMark(id, field, value);
  };

  const calculateMarks = () => {
    // ✅ FIXED: Changed from subjectMarks to subjects to match context
    const total = formData.subjects.reduce((sum: number, item: SubjectMark) => {
      const mark = parseFloat(item.mark) || 0;
      return sum + mark;
    }, 0);
    
    // ✅ FIXED: Changed from subjectMarks to subjects
    const percentage = formData.subjects.length > 0 ? 
      (total / (formData.subjects.length * 100)) * 100 : 0;
    
    let cutoff = 0;
    
    // ✅ FIXED: Changed from subjectMarks to subjects
    const math = formData.subjects.find((sm: SubjectMark) => 
      sm.subject.toLowerCase().includes('maths') || sm.subject.toLowerCase().includes('mathematics')
    );
    const physics = formData.subjects.find((sm: SubjectMark) => 
      sm.subject.toLowerCase().includes('physics')
    );
    const chemistry = formData.subjects.find((sm: SubjectMark) => 
      sm.subject.toLowerCase().includes('chemistry')
    );

    if (math && physics && chemistry) {
      const mathMark = parseFloat(math.mark) || 0;
      const phyMark = parseFloat(physics.mark) || 0;
      const chemMark = parseFloat(chemistry.mark) || 0;
      cutoff = (mathMark / 2) + (phyMark / 4) + (chemMark / 4);
    }

    updateFormData({
      // ✅ FIXED: Changed to snake_case to match context
      total_marks: total.toString(),
      mark_percentage: percentage.toFixed(2),
      cutoff_marks: cutoff ? cutoff.toFixed(2) : ''
    });
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // ✅ FIXED: Changed to snake_case field names
      if (!formData.first_name) newErrors.first_name = 'First name is required';
      if (!formData.last_name) newErrors.last_name = 'Last name is required';
      if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
      if (!formData.aadhaar_number) newErrors.aadhaar_number = 'Aadhaar number is required';
      if (formData.aadhaar_number && !/^\d{12}$/.test(formData.aadhaar_number)) {
        newErrors.aadhaar_number = 'Aadhaar number must be 12 digits';
      }
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.father_name) newErrors.father_name = "Father's name is required";
    }

    if (step === 2) {
      // ✅ FIXED: Changed to snake_case field names
      if (!formData.school_name) newErrors.school_name = 'School name is required';
      if (!formData.exam_register_number) newErrors.exam_register_number = 'Exam register number is required';
      // ✅ FIXED: Changed from subjectMarks to subjects
      if (formData.subjects.some((sm: SubjectMark) => !sm.subject || !sm.mark)) {
        newErrors.subjects = 'All subject fields must be filled';
      }
    }

    if (step === 3) {
      // ✅ FIXED: Changed to snake_case field names
      if (!formData.course_type) newErrors.course_type = 'Course type is required';
      if (!formData.course_name) newErrors.course_name = 'Course name is required';
    }

    if (step === 4) {
      if (!isConfirmChecked) {
        newErrors.confirm = 'Please confirm that all information is accurate';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSaveDraft = () => {
    saveDraft();
    setIsDraftSaved(true);
    setTimeout(() => setIsDraftSaved(false), 3000);
  };

  const handleSubmitApplication = async () => {
    if (!validateStep(4)) {
      setSubmitStatus('error');
      setSubmitMessage('Please fix validation errors before submitting');
      return;
    }

    if (!isConfirmChecked) {
      setSubmitStatus('error');
      setSubmitMessage('Please confirm that all information is accurate');
      return;
    }

    setSubmitStatus('loading');
    setSubmitMessage('Submitting your application...');

    try {
      calculateMarks();
      
      const response = await submitApplication();
      
      setSubmitStatus('success');
      setSubmitMessage('Application submitted successfully!');
      
      const updatedUser = { 
        ...user, 
        applicationStatus: 'submitted',
        applicationDate: new Date().toISOString(),
        applicationId: response.admission_id,
        student_id: response.student_id
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      localStorage.removeItem('admissionDraft');
      
      setTimeout(() => {
        onNavigate('student-dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Submission failed. Please try again.';
      setSubmitStatus('error');
      setSubmitMessage(errorMessage);
      
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    }
  };

  const renderPersonalInfo = () => (
      <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            name="first_name" // ✅ FIXED: Changed to snake_case
            value={formData.first_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.first_name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            name="last_name" // ✅ FIXED: Changed to snake_case
            value={formData.last_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.last_name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            name="phone_number" // ✅ FIXED: Changed to snake_case
            value={formData.phone_number}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone_number ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number *</label>
          <input
            type="text"
            name="aadhaar_number" // ✅ FIXED: Changed to snake_case
            value={formData.aadhaar_number}
            onChange={handleInputChange}
            maxLength={12}
            placeholder="12-digit Aadhaar number"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.aadhaar_number ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.aadhaar_number && <p className="text-red-500 text-sm mt-1">{errors.aadhaar_number}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
          <select
            name="blood_group" // ✅ FIXED: Changed to snake_case
            value={formData.blood_group}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Blood Group</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
          <input
            type="date"
            name="date_of_birth" // ✅ FIXED: Changed to snake_case
            value={formData.date_of_birth}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.date_of_birth ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.gender ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.address ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>

      <h4 className="text-md font-medium text-gray-800 mt-6 mb-4">Family Information</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
          <input
            type="text"
            name="father_name" // ✅ FIXED: Changed to snake_case
            value={formData.father_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.father_name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.father_name && <p className="text-red-500 text-sm mt-1">{errors.father_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father's Occupation</label>
          <input
            type="text"
            name="father_occupation" // ✅ FIXED: Changed to snake_case
            value={formData.father_occupation}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
          <input
            type="text"
            name="mother_name" // ✅ FIXED: Changed to snake_case
            value={formData.mother_name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Occupation</label>
          <input
            type="text"
            name="mother_occupation" // ✅ FIXED: Changed to snake_case
            value={formData.mother_occupation}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income (₹)</label>
          <input
            type="number"
            name="annual_income" // ✅ FIXED: Changed to snake_case
            value={formData.annual_income}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Community</label>
          <select
            name="community"
            value={formData.community}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Community</option>
            {communities.map(community => (
              <option key={community} value={community}>{community}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Caste</label>
          <input
            type="text"
            name="caste"
            value={formData.caste}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
          <select
            name="religion"
            value={formData.religion}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Religion</option>
            {religions.map(religion => (
              <option key={religion} value={religion}>{religion}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderAcademicHistory = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">School Name *</label>
          <input
            type="text"
            name="school_name" // ✅ FIXED: Changed to snake_case
            value={formData.school_name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.school_name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.school_name && <p className="text-red-500 text-sm mt-1">{errors.school_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Exam Register Number *</label>
          <input
            type="text"
            name="exam_register_number" // ✅ FIXED: Changed to snake_case
            value={formData.exam_register_number}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.exam_register_number ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.exam_register_number && <p className="text-red-500 text-sm mt-1">{errors.exam_register_number}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">EMIS Number</label>
        <input
          type="text"
          name="emis_no" // ✅ FIXED: Changed to snake_case
          value={formData.emis_no}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Subject Marks *</label>
          <button
            type="button"
            onClick={addSubjectMark}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subject</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {/* ✅ FIXED: Changed from subjectMarks to subjects */}
          {formData.subjects.map((subjectMark, index) => (
            <div key={subjectMark.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-5">
                <input
                  type="text"
                  placeholder="Subject name"
                  value={subjectMark.subject}
                  onChange={(e) => handleSubjectChange(subjectMark.id, 'subject', e.target.value)}
                  onBlur={calculateMarks}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-5">
                <input
                  type="number"
                  placeholder="Mark scored"
                  value={subjectMark.mark}
                  onChange={(e) => handleSubjectChange(subjectMark.id, 'mark', e.target.value)}
                  onBlur={calculateMarks}
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                {/* ✅ FIXED: Changed from subjectMarks to subjects */}
                {formData.subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubjectMark(subjectMark.id)}
                    className="w-full px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
          <input
            type="text"
            name="total_marks" // ✅ FIXED: Changed to snake_case
            value={formData.total_marks}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Percentage</label>
          <input
            type="text"
            name="mark_percentage" // ✅ FIXED: Changed to snake_case
            value={formData.mark_percentage}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cut-off</label>
          <input
            type="number"
            name="cutoff_marks" // ✅ FIXED: Changed to snake_case
            value={formData.cutoff_marks}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Month & Year of Passing</label>
          <input
            type="month"
            name="month_year_passing" // ✅ FIXED: Changed to snake_case
            value={formData.month_year_passing}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <h4 className="text-md font-medium text-gray-800 mt-6 mb-4">Document Upload</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Passport Photo</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              onChange={(e) => handleFileChange(e, 'passport_photo')} // ✅ FIXED: Changed to snake_case
              accept=".jpg,.jpeg,.png"
              className="hidden"
              id="passport_photo"
            />
            <label
              htmlFor="passport_photo"
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Choose file
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Card</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <input
              type="file"
              onChange={(e) => handleFileChange(e, 'aadhaar_card')} // ✅ FIXED: Changed to snake_case
              accept=".jpg,.jpeg,.png"
              className="hidden"
              id="aadhaar_card"
            />
            <label
              htmlFor="aadhaar_card"
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Choose file
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG (Max 2MB)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourseSelection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Selection</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Type *</label>
          <select
            name="course_type"
            value={formData.course_type}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.course_type ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select Course Type</option>
            {courseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.course_type && <p className="text-red-500 text-sm mt-1">{errors.course_type}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
          <select
            name="course_name"
            value={formData.course_name}
            onChange={handleInputChange}
            disabled={!formData.course_type}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.course_name ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select Course</option>
            {getCourseOptions(formData.course_type).map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          {errors.course_name && <p className="text-red-500 text-sm mt-1">{errors.course_name}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Course Mode</label>
        <select
          name="course_mode"
          value={formData.course_mode}
          onChange={handleInputChange}
          disabled={!formData.course_name}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Mode</option>
          {getCourseModes(formData.course_name).map(mode => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </div>

      <h4 className="text-md font-medium text-gray-800 mt-6 mb-4">Extra Information</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Physically Challenged</label>
          <select
            name="physically_challenged"
            value={formData.physically_challenged}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ex-Serviceman</label>
          <select
            name="ex_serviceman"
            value={formData.ex_serviceman}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Extra Curricular Activities</label>
        <select
          name="activities"
          value={formData.activities}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Activity</option>
          {activities.map(activity => (
            <option key={activity} value={activity}>{activity}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Certificate</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'transferCertificate')}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            id="transfer-cert"
          />
          <label
            htmlFor="transfer-cert"
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Choose file
          </label>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
        </div>
      </div>
    </div>
  );

  const renderReviewSubmit = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Submit</h3>
    
     {/* Success/Error Alerts */}
    {submitStatus === 'success' && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="text-green-800 font-medium">Success!</h4>
            <p className="text-green-700 text-sm mt-1">{submitMessage}</p>
            <p className="text-green-600 text-xs mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )}

    {submitStatus === 'error' && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <h4 className="text-red-800 font-medium">Submission Failed</h4>
            <p className="text-red-700 text-sm mt-1">{submitMessage}</p>
          </div>
        </div>
      </div>
    )}

    {submitStatus === 'loading' && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Loader className="h-5 w-5 text-blue-600 animate-spin" />
          <div>
            <h4 className="text-blue-800 font-medium">Processing...</h4>
            <p className="text-blue-700 text-sm mt-1">{submitMessage}</p>
          </div>
        </div>
      </div>
    )}

    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="font-medium text-gray-900 mb-4">Application Summary</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Personal Information</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Phone:</strong> {formData.phone_number}</p> {/* ✅ fixed */}
            <p><strong>Aadhaar:</strong> {formData.aadhaar_number}</p>
            <p><strong>Date of Birth:</strong> {formData.date_of_birth}</p>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Academic Background</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>School:</strong> {formData.school_name}</p>
            <p><strong>Register No:</strong> {formData.exam_register_number}</p>
            <p><strong>Total Marks:</strong> {formData.total_marks}</p>
            <p><strong>Percentage:</strong> {formData.mark_percentage}%</p>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Course Selection</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Course Type:</strong> {formData.course_type}</p> {/* ✅ fixed */}
            <p><strong>Course Name:</strong> {formData.course_name}</p> {/* ✅ fixed */}
            <p><strong>Course Mode:</strong> {formData.course_mode}</p> {/* ✅ fixed */}
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Documents Status</h5>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Photo:</strong> {formData.passport_photo ? '✓ Uploaded' : '✗ Not uploaded'}</p>
            <p><strong>Aadhaar Card:</strong> {formData.aadhaar_card ? '✓ Uploaded' : '✗ Not uploaded'}</p> {/* ✅ fixed */}
            <p><strong>Transfer Certificate:</strong> {formData.transfer_certificate ? '✓ Uploaded' : '✗ Not uploaded'}</p> {/* ✅ fixed */}
          </div>
        </div>
      </div>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="text-yellow-600 mt-0.5">
          <Eye className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-yellow-800 font-medium">Before You Submit</h4>
          <ul className="text-yellow-700 text-sm mt-2 space-y-1">
            <li>• Please review all information carefully before submitting</li>
            <li>• Ensure all required documents are uploaded</li>
            <li>• Once submitted, you cannot edit the application</li>
            <li>• Application will be verified by the administration</li>
          </ul>
        </div>
      </div>
    </div>

     <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          id="confirm-submit"
          checked={isConfirmChecked}
          onChange={(e) => setIsConfirmChecked(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="confirm-submit" className="text-sm text-gray-700">
          I confirm that all information provided is true and accurate to the best of my knowledge
        </label>
      </div>

    {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
  </div>
);


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderAcademicHistory();
      case 3:
        return renderCourseSelection();
      case 4:
        return renderReviewSubmit();
      default:
        return renderPersonalInfo();
    }
  };

  return (
     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">College Application Form</h1>
            <p className="text-blue-100">Complete your application in {totalSteps} simple steps</p>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;
                
                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-blue-100 border-blue-500 text-blue-500'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className={`text-sm font-medium ${
                          isCurrent ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          Step {step.number}
                        </div>
                        <div className="text-xs text-gray-400">{step.title}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons Section */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  disabled={submitStatus === 'loading'}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveDraft}
                disabled={submitStatus === 'loading'}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={submitStatus === 'loading'}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitApplication}
                  disabled={submitStatus === 'loading' || !isConfirmChecked}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Draft Saved Notification */}
        {isDraftSaved && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Draft saved successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationForm;