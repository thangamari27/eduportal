import { useState, useCallback } from 'react';
import { useAdmin } from '../contexts/AdminContext';

export const useAdminDashboard = () => {
  const {
    stats,
    applications,
    users,
    courses,
    statsLoading,
    applicationsLoading,
    usersLoading,
    coursesLoading,
    refreshStats,
    refreshApplications,
    refreshUsers,
    refreshCourses,
    updateApplicationStatus,
  } = useAdmin();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'applications' | 'users' | 'courses'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.admission_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalInfo?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.personalInfo?.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.application_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter courses based on search
  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.duration?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([
      refreshStats(),
      refreshApplications(),
      refreshUsers(),
      refreshCourses(),
    ]);
  }, [refreshStats, refreshApplications, refreshUsers, refreshCourses]);

  const handleUpdateStatus = async (admissionId: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      await updateApplicationStatus(admissionId, status);
    } catch (error) {
      throw error;
    }
  };

  return {
    // Data
    stats,
    applications: filteredApplications,
    users: filteredUsers,
    courses: filteredCourses,
    
    // Loading states
    statsLoading,
    applicationsLoading,
    usersLoading,
    coursesLoading,
    
    // UI state
    selectedTab,
    setSelectedTab,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    
    // Actions
    refreshStats,
    refreshApplications,
    refreshUsers,
    refreshCourses,
    handleRefreshAll,
    handleUpdateStatus,
  };
};