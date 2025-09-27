import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Upload, Save, Camera, FileText, CheckCircle } from 'lucide-react';

interface ProfilePageProps {
  user: any;
  onNavigate: (page: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: user?.email || 'john@example.com',
    phone: '+1 234-567-8901',
    address: '123 Main Street, City, State 12345',
    dateOfBirth: '1995-06-15',
    profilePicture: null
  });

  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: '10th Grade Certificate',
      type: 'academic',
      status: 'uploaded',
      uploadDate: '2024-01-15',
      file: null
    },
    {
      id: 2,
      name: '12th Grade Certificate',
      type: 'academic',
      status: 'uploaded',
      uploadDate: '2024-01-15',
      file: null
    },
    {
      id: 3,
      name: 'ID Proof (Aadhar/Passport)',
      type: 'identity',
      status: 'pending',
      uploadDate: null,
      file: null
    },
    {
      id: 4,
      name: 'Passport Size Photo',
      type: 'photo',
      status: 'uploaded',
      uploadDate: '2024-01-15',
      file: null
    },
    {
      id: 5,
      name: 'Income Certificate (Optional)',
      type: 'financial',
      status: 'pending',
      uploadDate: null,
      file: null
    }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const saveProfile = () => {
    // Save profile data
    localStorage.setItem('profileData', JSON.stringify(profileData));
    alert('Profile saved successfully!');
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
      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {profileData.profilePicture ? (
              <img 
                src={URL.createObjectURL(profileData.profilePicture)} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{profileData.firstName} {profileData.lastName}</h3>
          <p className="text-gray-600">{profileData.email}</p>
          <p className="text-sm text-gray-500">Student ID: #STU2024001</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="firstName"
              value={profileData.firstName}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={profileData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

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
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
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
                <div className={`p-2 rounded-full ${
                  document.status === 'uploaded' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <FileText className={`h-5 w-5 ${
                    document.status === 'uploaded' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
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
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    View Document
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Replace
                  </button>
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
                  <label
                    htmlFor={`file-${document.id}`}
                    className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (Max 5MB)
                  </p>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'documents':
        return renderDocuments();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and documents</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'documents', label: 'Documents', icon: FileText }
            ].map((tab) => (
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

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;