// hooks/useAuthSync.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  applicationStatus?: string;
}

export const useAuthSync = () => {
  const { user: authUser, userType } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const syncUserData = () => {
      // Priority 1: Use AuthContext user data (most reliable)
      if (authUser && userType) {
        const transformedUser: UserType = {
          id: authUser.id,
          name: authUser.name || authUser.email,
          email: authUser.email,
          role: userType === 'admin' ? 'admin' : 'student',
          applicationStatus: (authUser as any).applicationStatus
        };
        setUser(transformedUser);
        localStorage.setItem('currentUser', JSON.stringify(transformedUser));
        return transformedUser;
      }
      
      // Priority 2: Fallback to localStorage
      const storedUser = localStorage.getItem('user');
      const storedUserType = localStorage.getItem('userType');
      
      if (storedUser && storedUserType) {
        try {
          const userData = JSON.parse(storedUser);
          const userType: 'student' | 'admin' = storedUserType === 'admin' ? 'admin' : 'student';
          
          const transformedUser: UserType = {
            id: userData.id,
            name: userData.name || userData.email,
            email: userData.email,
            role: userType,
            applicationStatus: userData.applicationStatus
          };
          
          setUser(transformedUser);
          return transformedUser;
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      
      // No user found
      setUser(null);
      return null;
    };

    syncUserData();
  }, [authUser, userType]);

  return user;
};