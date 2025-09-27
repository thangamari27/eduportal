// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/UserApiService';

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  student_id?: string;
  email: string;
  phone_no?: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: User | null;
  userType: 'user' | 'admin' | null;
  login: (email: string, password: string, userType?: 'user' | 'admin') => Promise<void>;
  smartLogin: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  switchUserType: (email: string, password: string, newUserType: 'user' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setUser({ ...userData, role, token });
        setUserType(storedUserType);

        // Verify token is still valid
        await apiService.getProfile();
      } catch {
        apiService.logout();
        setUser(null);
        setUserType(null);
      }
    }
    setIsLoading(false);
  };

  const createUserObject = (userData: any, token: string, role: UserRole): User => ({
    ...userData,
    role,
    token,
  });

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
      setUserType(resolvedType);

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('userType', resolvedType);
    } finally {
      setIsLoading(false);
    }
  };

  const smartLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Try user login first
      try {
        const { user: userData, token } = await apiService.login({ email, password }, 'user');
        const userObj: User = { ...userData, token, role: 'student' };

        setUser(userObj);
        setUserType('user');
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('userType', 'user');
        localStorage.setItem('authToken', token);
        return;
      } catch {
        // If user login fails, try admin
        const { admin: adminData, token } = await apiService.adminLogin({ email, password });
        const userObj: User = { ...adminData, token, role: 'admin' };

        setUser(userObj);
        setUserType('admin');
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('authToken', token);
      }
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
    } finally {
      setIsLoading(false);
    }
  };

  const switchUserType = async (email: string, password: string, newUserType: 'user' | 'admin') => {
    await login(email, password, newUserType);
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    setUserType(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        login,
        smartLogin,
        adminLogin,
        register,
        logout,
        isLoading,
        switchUserType,
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
