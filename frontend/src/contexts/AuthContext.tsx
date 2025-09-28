// src/contexts/AuthContext.tsx - COMPLETELY FIXED
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/UserApiService';
import { profileService, type Profile } from '../services/profileService';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone_no?: string;
  student_id?: string;
  role: 'student' | 'admin';
  applicationStatus?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  userType: 'user' | 'admin' | null;
  isLoading: boolean;
  
  // Profile data state - now properly typed
  profileData: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
  
  // Authentication methods
  login: (email: string, password: string, userType?: 'user' | 'admin') => Promise<void>;
  smartLogin: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  switchUserType: (email: string, password: string, newUserType: 'user' | 'admin') => Promise<void>;
  
  // Profile management methods
  refreshProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  updateProfileField: (field: keyof Profile, value: any) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  clearProfileError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile state - now properly typed
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const storedUserType = localStorage.getItem('userType') as 'user' | 'admin' | null;

    if (token && storedUser && storedUserType) {
      try {
        const userData = JSON.parse(storedUser) as Omit<User, 'role' | 'token'>;
        const role: UserRole = storedUserType === 'admin' ? 'admin' : 'student';
        const userObj = { ...userData, role, token };
        
        setUser(userObj);
        setUserType(storedUserType);
        
        // Load profile data using the new simplified approach
        await loadProfileData();

        // Verify token is still valid
        await apiService.getProfile();
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  };

  // SIMPLIFIED: Single source of truth from profileService
  const loadProfileData = async (): Promise<void> => {
    if (!profileService.isAuthenticated()) return;
    
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      const result = await profileService.getProfile();
      
      if (result.success && result.data) {
        setProfileData(result.data);
      } else {
        setProfileError(result.error || 'Failed to load profile data');
        // Create basic profile from user data as fallback
        if (user) {
          setProfileData({
            id: parseInt(user.id) || 0,
            email: user.email,
            first_name: user.name?.split(' ')[0] || '',
            last_name: user.name?.split(' ').slice(1).join(' ') || '',
            phone_number: user.phone_no || '',
            date_of_birth: null,
            gender: '',
            address: '',
            student_id: user.student_id
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      setProfileError('Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const createUserObject = (userData: any, token: string, role: UserRole): User => ({
    ...userData,
    name: userData.name || userData.email?.split('@')[0] || 'User',
    role,
    token,
  });

  // ✅ AUTH METHODS - Updated to use new profile loading
  const login = async (email: string, password: string, type: 'user' | 'admin' = 'user') => {
    setIsLoading(true);
    try {
      const { user: userData, token, userType: resolvedType } = await apiService.login(
        { email, password },
        type
      );
      const role: UserRole = resolvedType === 'admin' ? 'admin' : 'student';
      const userObj = createUserObject(userData, token, role);

      setUser(userObj);
      setUserType(resolvedType as 'user' | 'admin');
      
      // Save to localStorage first
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('userType', resolvedType);
      
      // Then load profile data
      await loadProfileData();
    } finally {
      setIsLoading(false);
    }
  };

  const smartLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      let userData, token, resolvedType;

      try {
        const result = await apiService.login({ email, password }, 'user');
        userData = result.user;
        token = result.token;
        resolvedType = 'user';
      } catch {
        const result = await apiService.adminLogin({ email, password });
        userData = result.admin;
        token = result.token;
        resolvedType = 'admin';
      }

      const role: UserRole = resolvedType === 'admin' ? 'admin' : 'student';
      const userObj = createUserObject(userData, token, role);

      setUser(userObj);
      setUserType(resolvedType as 'user' | 'admin');
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('userType', resolvedType);
      
      await loadProfileData();
    } catch (error: any) {
      throw new Error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { admin: adminData, token } = await apiService.adminLogin({ email, password });
      const userObj = createUserObject(adminData, token, 'admin');

      setUser(userObj);
      setUserType('admin');
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('userType', 'admin');
      
      await loadProfileData();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: userData, token } = await apiService.register({
        email,
        phone_no: phone,
        password,
      });
      const userObj = createUserObject(userData, token, 'student');

      setUser(userObj);
      setUserType('user');
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('userType', 'user');
      
      await loadProfileData();
    } finally {
      setIsLoading(false);
    }
  };

  const switchUserType = async (email: string, password: string, newUserType: 'user' | 'admin') => {
    await login(email, password, newUserType);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setUser(null);
    setUserType(null);
    setProfileData(null);
    setProfileError(null);
  };

  // ✅ UPDATED PROFILE METHODS - Simplified and consistent
  const refreshProfile = async (): Promise<void> => {
    await loadProfileData();
  };

  const updateProfile = async (newProfileData: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }
      
      try {
        setProfileLoading(true);
        setProfileError(null);
        
        const result = await profileService.updateProfile(newProfileData);
        
        if (result.success && result.data) {
          // ✅ FIXED: Proper state update that always returns Profile | null
          setProfileData(prev => {
            if (result.data) {
              return prev ? { ...prev, ...result.data } : result.data;
            }
            return prev; // Always return Profile | null
          });
          
          // Update user state if name or email changed
          if (newProfileData.first_name || newProfileData.last_name || newProfileData.email) {
            const updatedName = newProfileData.first_name && newProfileData.last_name 
              ? `${newProfileData.first_name} ${newProfileData.last_name}`
              : undefined;
              
            const updatedUser = { 
              ...user, 
              ...(updatedName && { name: updatedName }),
              ...(newProfileData.email && { email: newProfileData.email })
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
          
          return { success: true };
        } else {
          const errorMsg = result.error || 'Failed to update profile';
          setProfileError(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Network error updating profile';
        setProfileError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setProfileLoading(false);
      }
    };

  const updateProfileField = async (field: keyof Profile, value: any): Promise<{ success: boolean; error?: string }> => {
    return updateProfile({ [field]: value } as Partial<Profile>);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setProfileError(null);
      
      const result = await profileService.changePassword({ currentPassword, newPassword });
      
      if (result.success) {
        return { success: true };
      } else {
        const errorMsg = result.error || 'Password change failed';
        setProfileError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Network error changing password';
      setProfileError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const clearProfileError = () => {
    setProfileError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        isLoading,
        profileData,
        profileLoading,
        profileError,
        login,
        smartLogin,
        adminLogin,
        register,
        logout,
        switchUserType,
        refreshProfile,
        updateProfile,
        updateProfileField,
        changePassword,
        clearProfileError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};