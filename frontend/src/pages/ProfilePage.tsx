import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Upload, Save, Camera, FileText, CheckCircle, Calendar, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Core profile data interface
interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  address: string;
}

interface UserData {
  id: number;
  email: string;
  phone_no: string;
  student_id?: string;
  profileData: ProfileData;
}

interface ProfilePageProps {
  user?: any; 
  isAdmin?: boolean;
  onNavigate?: (page: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, isAdmin = false, onNavigate }) => {
  const { 
    profileData: authProfileData, 
    profileLoading, 
    profileError,
    updateProfile,
    updateProfileField,
    clearProfileError,
    refreshProfile
  } = useAuth();

  const [activeTab, setActiveTab] = useState('personal');
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: ''
  });

  type DocumentItem = {
    id: number;
    name: string;
    type: string;
    status: string;
    uploadDate: string | null;
    file: File | null;
  };

  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: 1, name: '10th Grade Certificate', type: 'academic', status: 'uploaded', uploadDate: '2024-01-15', file: null },
    { id: 2, name: '12th Grade Certificate', type: 'academic', status: 'uploaded', uploadDate: '2024-01-15', file: null },
    { id: 3, name: 'ID Proof (Aadhar/Passport)', type: 'identity', status: 'pending', uploadDate: null, file: null },
    { id: 4, name: 'Passport Size Photo', type: 'photo', status: 'uploaded', uploadDate: '2024-01-15', file: null },
    { id: 5, name: 'Income Certificate (Optional)', type: 'financial', status: 'pending', uploadDate: null, file: null }
  ]);

  // Load initial profile data from multiple sources
    // Load initial profile data from multiple sources
useEffect(() => {
  console.log('🔄 ProfilePage: Data sources changed');
  console.log('AuthContext profileData:', authProfileData);
  console.log('Legacy user prop:', user);
  
  let finalProfileData = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: ''
  };

  // Priority 1: Use AuthContext profile data
  if (authProfileData) {
    console.log('✅ Using AuthContext profile data');
    
    // Extract username from email if first_name is empty
    const userName = authProfileData.email?.split('@')[0] || 'User';
    
    finalProfileData = {
      first_name: authProfileData.first_name || userName,
      last_name: authProfileData.last_name || '',
      email: authProfileData.email || '',
      phone_number: authProfileData.phone_number || authProfileData.phone_number || '',
      date_of_birth: authProfileData.date_of_birth || '',
      gender: authProfileData.gender || '',
      address: authProfileData.address || ''
    };
  }
  // Priority 2: Use legacy user prop data
  else if (user && user.profileData) {
    console.log('✅ Using legacy user.profileData');
    finalProfileData = {
      first_name: user.profileData.first_name || '',
      last_name: user.profileData.last_name || '',
      email: user.profileData.email || user.email || '',
      phone_number: user.profileData.phone_number || user.phone_no || '',
      date_of_birth: user.profileData.date_of_birth || '',
      gender: user.profileData.gender || '',
      address: user.profileData.address || ''
    };
  }
  // Priority 3: Use basic user data
  else if (user) {
    console.log('✅ Using basic user data');
    const userName = user.name || user.email?.split('@')[0] || 'User';
    
    finalProfileData = {
      first_name: userName,
      last_name: '',
      email: user.email || '',
      phone_number: user.phone_no || '',
      date_of_birth: '',
      gender: '',
      address: ''
    };
  } else {
    console.log('❌ No user data available');
  }

  console.log('🎯 Final profile data to display:', finalProfileData);
  setProfileData(finalProfileData);
}, [authProfileData, user]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  // Sync AuthContext errors with local message state
  useEffect(() => {
    if (profileError) {
      setMessage({ type: 'error', text: profileError });
    }
  }, [profileError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (documentId: number, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: 'uploaded', file, uploadDate: new Date().toISOString().split('T')[0] }
        : doc
    ));
  };

  const saveProfile = async () => {
  try {
    setSaveLoading(true);
    clearProfileError();
    
    // Prepare data for update - use destructuring instead of delete
    const { email, phone_number, ...profileDataToSave } = profileData;
    
    // For non-admins, use the filtered data
    const dataToSave = isAdmin ? profileData : profileDataToSave;

    // Use AuthContext updateProfile method
    const result = await updateProfile(dataToSave);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      // Refresh to get latest data
      await refreshProfile();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to save profile' });
    }
  } catch (error) {
    console.error('Save profile error:', error);
    setMessage({ type: 'error', text: 'Error saving profile' });
  } finally {
    setSaveLoading(false);
  }
};

  // NEW: Single field update using AuthContext
  const handleSingleFieldUpdate = async (field: keyof ProfileData, value: string) => {
    try {
      clearProfileError();
      const result = await updateProfileField(field, value);
      
      if (result.success) {
        setMessage({ type: 'success', text: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!` });
        await refreshProfile();
      } else {
        setMessage({ type: 'error', text: result.error || `Failed to update ${field}` });
      }
    } catch (error) {
      console.error('Update field error:', error);
      setMessage({ type: 'error', text: `Error updating ${field}` });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {profileData.first_name || profileData.last_name 
              ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() 
              : 'Complete your profile'
            }
          </h3>
          <p className="text-gray-600">{profileData.email}</p>
          {user?.student_id && <p className="text-sm text-gray-500">Student ID: {user.student_id}</p>}
          {isAdmin && <p className="text-sm text-blue-600">Administrator</p>}
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              name="first_name" 
              value={profileData.first_name} 
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter your first name" 
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              name="last_name" 
              value={profileData.last_name} 
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter your last name" 
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="email" 
              name="email" 
              value={profileData.email} 
              disabled={!isAdmin}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                isAdmin ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 text-gray-600 cursor-not-allowed'
              }`} 
            />
          </div>
          {!isAdmin && <p className="text-xs text-gray-500 mt-1">Email cannot be changed from profile</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="tel" 
              name="phone_number" 
              value={profileData.phone_number} 
              onChange={isAdmin ? handleInputChange : undefined}
              disabled={!isAdmin}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg ${
                isAdmin ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 text-gray-600 cursor-not-allowed'
              }`} 
              placeholder="Enter your phone number" 
            />
          </div>
          {!isAdmin && <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed from profile</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="date" 
              name="date_of_birth" 
              value={profileData.date_of_birth} 
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select 
              name="gender" 
              value={profileData.gender} 
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea 
            name="address" 
            value={profileData.address} 
            onChange={handleInputChange}
            rows={3}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Enter your complete address" 
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
        <button 
          onClick={saveProfile} 
          disabled={saveLoading || profileLoading}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Management</h3>
        <p className="text-gray-600">Upload and manage your required documents for admission.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((document) => (
          <div key={document.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${document.status === 'uploaded' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <FileText className={`h-5 w-5 ${document.status === 'uploaded' ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{document.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">{document.type} Document</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                {document.status}
              </span>
            </div>

            {document.status === 'uploaded' ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Uploaded on {document.uploadDate}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">View Document</button>
                  <button onClick={() => document.file && handleFileUpload(document.id, document.file)} className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Replace</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    onChange={(e) => { 
                      const file = e.target.files?.[0]; 
                      if (file) handleFileUpload(document.id, file); 
                    }} 
                    className="hidden" 
                    id={`file-${document.id}`} 
                  />
                  <label htmlFor={`file-${document.id}`} className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">Choose File</label>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                </div>
                <p className="text-sm text-gray-500">
                  {document.type === 'academic' && 'Upload your academic certificates'}
                  {document.type === 'identity' && 'Upload government issued ID proof'}
                  {document.type === 'photo' && 'Upload passport size photograph'}
                  {document.type === 'financial' && 'Upload income certificate (optional)'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Document Guidelines</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• All documents should be clear and legible</li>
          <li>• Accepted formats: PDF, JPG, PNG</li>
          <li>• Maximum file size: 5MB per document</li>
          <li>• Documents should be in English or translated</li>
          <li>• Ensure all required documents are uploaded before application review</li>
        </ul>
      </div>
    </div>
  );

  const renderTabContent = () => activeTab === 'documents' ? renderDocuments() : renderPersonalInfo();

  if (profileLoading && !authProfileData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{isAdmin ? 'Admin Profile Management' : 'Profile Management'}</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and documents</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'personal', label: 'Personal Info', icon: User }, 
              { id: 'documents', label: 'Documents', icon: FileText }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;