import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminService, AdminStats, Application, Course, User } from '../services/adminService';
import { useAuth } from './AuthContext';

interface AdminContextType {
  // Statistics
  stats: AdminStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
  // Applications
  applications: Application[];
  applicationsLoading: boolean;
  applicationsError: string | null;
  
  // Users
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
  
  // Courses
  courses: Course[];
  coursesLoading: boolean;
  coursesError: string | null;
  
  // Actions
  refreshStats: () => Promise<void>;
  refreshApplications: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshCourses: () => Promise<void>;
  
  updateApplicationStatus: (admissionId: string, status: 'Pending' | 'Approved' | 'Rejected') => Promise<void>;
  
  createCourse: (courseData: Partial<Course>) => Promise<void>;
  updateCourse: (id: number, courseData: Partial<Course>) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  
  clearErrors: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userType } = useAuth();
  const isAdmin = userType === 'admin';

  // State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [statsLoading, setStatsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [statsError, setStatsError] = useState<string | null>(null);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  

  // Statistics
  const refreshStats = useCallback(async () => {
    if (!isAdmin) {
      console.log('🛑 Non-admin user attempted to refresh stats');
      return;
    }
    
    setStatsLoading(true);
    setStatsError(null);
    try {
      console.log('📊 Fetching admin statistics...');
      const data = await adminService.getAdmissionStatistics();
      setStats(data);
      console.log('✅ Statistics loaded:', data);
    } catch (error: any) {
      console.error('❌ Failed to load statistics:', error);
      setStatsError(error.message || 'Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [isAdmin]);

  // Applications
  const refreshApplications = useCallback(async () => {
    if (!isAdmin) {
      console.log('🛑 Non-admin user attempted to refresh applications');
      return;
    }
    
    setApplicationsLoading(true);
    setApplicationsError(null);
    try {
      console.log('📋 Fetching applications...');
      const data = await adminService.getAllApplications();
      setApplications(data.applications || []);
      console.log('✅ Applications loaded:', data.applications?.length || 0, 'applications');
    } catch (error: any) {
      console.error('❌ Failed to load applications:', error);
      setApplicationsError(error.message || 'Failed to load applications');
    } finally {
      setApplicationsLoading(false);
    }
  }, [isAdmin]);

  // Users
  const refreshUsers = useCallback(async () => {
    if (!isAdmin) {
      console.log('🛑 Non-admin user attempted to refresh users');
      return;
    }
    
    setUsersLoading(true);
    setUsersError(null);
    try {
      console.log('👥 Fetching users...');
      const data = await adminService.getAllUsers();
      setUsers(data.users || []);
      console.log('✅ Users loaded:', data.users?.length || 0, 'users');
    } catch (error: any) {
      console.error('❌ Failed to load users:', error);
      setUsersError(error.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin]);

  // Courses
  const refreshCourses = useCallback(async () => {
    if (!isAdmin) {
      console.log('🛑 Non-admin user attempted to refresh courses');
      return;
    }
    
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      console.log('📚 Fetching courses...');
      const data = await adminService.getAllCourses();
      setCourses(data.courses || []);
      console.log('✅ Courses loaded:', data.courses?.length || 0, 'courses');
    } catch (error: any) {
      console.error('❌ Failed to load courses:', error);
      setCoursesError(error.message || 'Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  }, [isAdmin]);

  // ✅ FIXED: Single initialization function with proper error handling
  const initializeAdminData = useCallback(async () => {
    if (!isAdmin) {
      console.log('🛑 User is not admin, skipping admin data initialization');
      return;
    }

    // Debug authentication state
    const token = localStorage.getItem('authToken');
    const storedUserType = localStorage.getItem('userType');
    
    console.log('🔍 AdminContext Debug:', {
      isAdmin,
      token: token ? 'Present' : 'Missing',
      storedUserType,
      hasUser: !!user
    });

    if (!token) {
      console.error('❌ No auth token found for admin');
      return;
    }

    try {
      console.log('🔄 Initializing admin data...');
      await Promise.all([
        refreshStats(),
        refreshApplications(),
        refreshUsers(),
        refreshCourses(),
      ]);
      console.log('✅ Admin data initialized successfully');
    } catch (error: any) {
      console.error('❌ Admin data initialization failed:', error);
      
      // Handle specific error types
      if (error.message?.includes('token') || error.message?.includes('unauthorized') || error.message?.includes('401')) {
        console.error('🔐 Authentication failed - token may be invalid');
        // You might want to trigger logout here
        // logout();
      }
    }
  }, [isAdmin, refreshStats, refreshApplications, refreshUsers, refreshCourses]);

  // ✅ FIXED: Single useEffect for initialization
  useEffect(() => {
    initializeAdminData();
  }, [initializeAdminData]);

  // Application Status Update
  const updateApplicationStatus = async (admissionId: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    if (!isAdmin) {
      throw new Error('Only admins can update application status');
    }

    try {
      console.log(`🔄 Updating application ${admissionId} to ${status}`);
      await adminService.updateApplicationStatus(admissionId, status);
      // Refresh applications to get updated data
      await refreshApplications();
      await refreshStats(); // Refresh stats as well since counts changed
      console.log('✅ Application status updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update application status:', error);
      throw new Error(error.message || 'Failed to update application status');
    }
  };

  // Course Management
  const createCourse = async (courseData: Partial<Course>) => {
    if (!isAdmin) {
      throw new Error('Only admins can create courses');
    }

    try {
      console.log('🔄 Creating new course...');
      await adminService.createCourse(courseData);
      await refreshCourses();
      console.log('✅ Course created successfully');
    } catch (error: any) {
      console.error('❌ Failed to create course:', error);
      throw new Error(error.message || 'Failed to create course');
    }
  };

  const updateCourse = async (id: number, courseData: Partial<Course>) => {
    if (!isAdmin) {
      throw new Error('Only admins can update courses');
    }

    try {
      console.log(`🔄 Updating course ${id}...`);
      await adminService.updateCourse(id, courseData);
      await refreshCourses();
      console.log('✅ Course updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update course:', error);
      throw new Error(error.message || 'Failed to update course');
    }
  };

  const deleteCourse = async (id: number) => {
    if (!isAdmin) {
      throw new Error('Only admins can delete courses');
    }

    try {
      console.log(`🔄 Deleting course ${id}...`);
      await adminService.deleteCourse(id);
      await refreshCourses();
      console.log('✅ Course deleted successfully');
    } catch (error: any) {
      console.error('❌ Failed to delete course:', error);
      throw new Error(error.message || 'Failed to delete course');
    }
  };

  // Clear all errors
  const clearErrors = () => {
    setStatsError(null);
    setApplicationsError(null);
    setUsersError(null);
    setCoursesError(null);
  };

  const value: AdminContextType = {
    // Data
    stats,
    applications,
    users,
    courses,
    
    // Loading states
    statsLoading,
    applicationsLoading,
    usersLoading,
    coursesLoading,
    
    // Errors
    statsError,
    applicationsError,
    usersError,
    coursesError,
    
    // Actions
    refreshStats,
    refreshApplications,
    refreshUsers,
    refreshCourses,
    updateApplicationStatus,
    createCourse,
    updateCourse,
    deleteCourse,
    clearErrors,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};