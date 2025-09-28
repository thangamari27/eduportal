import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  User, 
  Upload,
  Bell,
  ArrowRight
} from 'lucide-react';
import { admissionService } from '../services/studentService';

interface UserType {
  name?: string;
  email?: string;
  role?: string;
  applicationStatus?: string;
  student_id?: string;
}

interface StudentDashboardProps {
  user: UserType;
  onNavigate: (page: string) => void;
}

interface ApplicationStatus {
  admission_id: string;
  application_status: 'Pending' | 'Approved' | 'Rejected';
  admission_timestamp: string;
  applied_time: string;
  student_name: string;
  course_name: string;
}

interface AdmissionStats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onNavigate }) => {
  const [admissionStats, setAdmissionStats] = useState<AdmissionStats>({
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0
  });
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch admission statistics
      const statsResponse = await admissionService.getAdmissionStatistics();
      if (statsResponse.success && statsResponse.data) {
        setAdmissionStats(statsResponse.data);
      } else {
        console.warn('Failed to fetch statistics:', statsResponse.error);
        // Use fallback stats
        setAdmissionStats({
          totalApplications: 0,
          approvedApplications: 0,
          pendingApplications: 0,
          rejectedApplications: 0
        });
      }

      // Fetch user's application status
      const statusResponse = await admissionService.getUserApplicationStatus();
      if (statusResponse.success && statusResponse.data) {
        setApplicationStatus([statusResponse.data]);
      } else {
        console.warn('Failed to fetch application status:', statusResponse.error);
        // Use fallback status
        setApplicationStatus([getFallbackApplicationStatus()]);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      // Set fallback data
      setAdmissionStats(getFallbackStats());
      setApplicationStatus([getFallbackApplicationStatus()]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback data functions
  const getFallbackStats = (): AdmissionStats => ({
    totalApplications: 3,
    approvedApplications: 1,
    pendingApplications: 1,
    rejectedApplications: 1
  });

  const getFallbackApplicationStatus = (): ApplicationStatus => ({
    admission_id: 'ADM001',
    application_status: 'Pending',
    admission_timestamp: new Date().toISOString(),
    applied_time: 'N/A',
    student_name: user?.name || 'Student',
    course_name: 'Not apply'
  });

  // Helper functions to transform backend data to frontend format
  const getStatusType = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'info';
      case 'Pending': return 'info';
      default: return 'info';
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'Approved': return 'Application Approved';
      case 'Rejected': return 'Application Needs Revision';
      case 'Pending': return 'Application Status Update';
      default: return 'Application Update';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Approved': return 'Application Approved';
      case 'Rejected': return 'Needs Revision';
      case 'Pending': return 'Application Submitted';
      default: return status;
    }
  };

  const mapBackendStatusToFrontend = (backendStatus: string) => {
    const statusMap: Record<string, string> = {
      'Approved': 'approved',
      'Rejected': 'rejected',
      'Pending': 'submitted'
    };
    return statusMap[backendStatus] || 'submitted';
  };

  // Transform application status for frontend display
  const notifications = applicationStatus.map(app => ({
    id: app.admission_id,
    type: getStatusType(app.application_status),
    title: getStatusTitle(app.application_status),
    message: `${app.course_name} - ${getStatusMessage(app.application_status)}`,
    time: app.applied_time,
    courseName: app.course_name,
    status: mapBackendStatusToFrontend(app.application_status)
  }));

  // Course applications data
  const courseApplications = applicationStatus.map(app => ({
    id: app.admission_id,
    courseName: app.course_name,
    status: mapBackendStatusToFrontend(app.application_status),
    appliedDate: new Date(app.admission_timestamp).toISOString().split('T')[0]
  }));

  // Status overview cards using real data
  const statusOverviewCards = [
    {
      title: 'Course Application Count',
      count: admissionStats.totalApplications,
      description: 'Total Applied',
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'Approved Applications',
      count: admissionStats.approvedApplications,
      description: 'Successfully Approved',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      title: 'Pending Review',
      count: admissionStats.pendingApplications,
      description: 'Awaiting Decision',
      icon: Clock,
      color: 'text-orange-500'
    }
  ];

  // ORIGINAL CODE PRESERVED
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

  const nextSteps = [
    { 
      title: 'Complete Application Form', 
      description: 'Fill out your personal and academic information',
      completed: applicationStatus.length > 0,
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
      completed: applicationStatus.some(app => app.application_status === 'Pending'),
      action: null
    },
    { 
      title: 'Admission Decision', 
      description: 'Receive your admission decision via email',
      completed: applicationStatus.some(app => app.application_status === 'Approved'),
      action: null
    }
  ];

  const quickActions = [
    { 
      title: applicationStatus.length > 0 ? 'View Application' : 'Start Application', 
      description: applicationStatus.length > 0 ? 'Check your application status' : 'Begin your admission application',
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

  const getDisplayName = (user: UserType | null): string => {
    if (!user) return 'Student';

    if (user.name) {
      return user.name;
    }

    if (user.email) {
      const nameFromEmail = user.email.split('@')[0];
      const cleanedName = nameFromEmail.replace(/[^a-zA-Z]/g, '');
      return cleanedName
        ? cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1).toLowerCase()
        : 'Student';
    }

    return user.role === 'admin' ? 'Administrator' : 'Student';
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {getDisplayName(user)}</h1>
          <p className="text-gray-600 mt-2">Track your application progress and manage your profile</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={handleRetry}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Status Overview - Using real data */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {statusOverviewCards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                      <p className="text-lg font-semibold text-gray-900">{card.count}</p>
                      <p className="text-sm text-gray-500">{card.description}</p>
                    </div>
                    <card.icon className={`h-8 w-8 ${card.color}`} />
                  </div>
                </div>
              ))}
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
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
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
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No applications found
                      </div>
                    )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;