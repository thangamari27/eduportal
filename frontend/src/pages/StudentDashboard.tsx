import React from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  User, 
  Upload,
  Calendar,
  Bell,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface StudentDashboardProps {
  user: any;
  onNavigate: (page: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onNavigate }) => {
  const applicationStatus = user?.applicationStatus || 'not-started';

  // Remove 'under-review' status option
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Application Submitted';
      case 'approved': return 'Approved';
      case 'rejected': return 'Needs Revision';
      default: return 'Not Started';
    }
  };

  // Mock data for course applications
  const courseApplications = [
    { id: 1, courseName: 'Computer Science', status: 'submitted', appliedDate: '2024-01-15' },
    { id: 2, courseName: 'Business Administration', status: 'approved', appliedDate: '2024-01-10' },
    { id: 3, courseName: 'Electrical Engineering', status: 'rejected', appliedDate: '2024-01-05' }
  ];

  const nextSteps = [
    { 
      title: 'Complete Application Form', 
      description: 'Fill out your personal and academic information',
      completed: applicationStatus !== 'not-started',
      action: () => onNavigate('application')
    },
    { 
      title: 'Upload Required Documents', 
      description: 'Upload academic certificates and ID proof',
      completed: false,
      action: () => onNavigate('profile')
    },
    { 
      title: 'Application Review', 
      description: 'Our team will review your application',
      completed: false,
      action: null
    },
    { 
      title: 'Admission Decision', 
      description: 'Receive your admission decision via email',
      completed: false,
      action: null
    }
  ];

  // Updated notifications to show application status with course names
  const notifications = [
    {
      id: 1,
      type: 'info',
      title: 'Application Status Update',
      message: 'Computer Science - Application Submitted',
      time: '2 hours ago',
      courseName: 'Computer Science',
      status: 'submitted'
    },
    {
      id: 2,
      type: 'success',
      title: 'Application Approved',
      message: 'Business Administration - Application Approved',
      time: '1 day ago',
      courseName: 'Business Administration',
      status: 'approved'
    },
    {
      id: 3,
      type: 'info',
      title: 'Application Needs Revision',
      message: 'Electrical Engineering - Needs Revision',
      time: '3 days ago',
      courseName: 'Electrical Engineering',
      status: 'rejected'
    }
  ];

  const quickActions = [
    { 
      title: 'Continue Application', 
      description: 'Complete your admission application',
      icon: FileText,
      color: 'bg-blue-500',
      action: () => onNavigate('application')
    },
    { 
      title: 'Browse Courses', 
      description: 'Explore available programs',
      icon: BookOpen,
      color: 'bg-green-500',
      action: () => onNavigate('courses')
    },
    { 
      title: 'Update Profile', 
      description: 'Manage your personal information',
      icon: User,
      color: 'bg-purple-500',
      action: () => onNavigate('profile')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="text-gray-600 mt-2">Track your application progress and manage your profile</p>
        </div>

        {/* Status Overview - Updated with useful options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Course Application Count */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Apply Course Applications</p>
                <p className="text-lg font-semibold text-gray-900">{courseApplications.length}</p>
                <p className="text-sm text-gray-500">Total Applied</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Approved Applications Count */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved Applications</p>
                <p className="text-lg font-semibold text-gray-900">
                  {courseApplications.filter(app => app.status === 'approved').length}
                </p>
                <p className="text-sm text-gray-500">Successfully Approved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Pending Applications Count */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-lg font-semibold text-gray-900">
                  {courseApplications.filter(app => app.status === 'submitted').length}
                </p>
                <p className="text-sm text-gray-500">Awaiting Decision</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
              <div className="space-y-4">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
                    <div className={`mt-1 ${step.completed ? 'text-green-500' : 'text-gray-400'}`}>
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-700'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {step.action && !step.completed && (
                        <button
                          onClick={step.action}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                        >
                          <span>Start Now</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-4 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                  >
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 rounded-lg bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${
                        notification.status === 'approved' ? 'text-green-500' : 
                        notification.status === 'rejected' ? 'text-red-500' : 'text-blue-500'
                      }`}>
                        {notification.status === 'approved' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : notification.status === 'rejected' ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Documents */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h2>
              <div className="space-y-3">
                {[
                  { name: 'Academic Transcript', status: 'uploaded', required: true },
                  { name: 'ID Proof', status: 'pending', required: true },
                  { name: 'Passport Photo', status: 'uploaded', required: true },
                  { name: 'Recommendation Letter', status: 'pending', required: false }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`${
                        doc.status === 'uploaded' ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {doc.status === 'uploaded' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.required ? 'Required' : 'Optional'}
                        </p>
                      </div>
                    </div>
                    {doc.status === 'pending' && (
                      <button 
                        onClick={() => onNavigate('profile')}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;