// AppContent.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext'; // ✅ useAuth can be used here
import { 
  User, BookOpen, Users, FileText, Menu, X, LogOut, Home, GraduationCap, UserCircle 
} from 'lucide-react';

import HomePage from './pages/HomePage';
import CourseCatalog from './pages/CourseCatalog';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import ApplicationForm from './pages/ApplicationForm';
import ProfilePage from './pages/ProfilePage';
import { ApplicationProvider } from './contexts/ApplicationContext';

interface UserType {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  applicationStatus?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<UserType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ✅ Now we can use useAuth because this component is inside AuthProvider
  const { user: authUser, userType, logout: authLogout } = useAuth();

  // ✅ Sync AuthContext with App state and handle page persistence
  useEffect(() => {
    const syncUserAndPage = () => {
      // Priority 1: Use AuthContext data
      if (authUser && userType) {
        const transformedUser: UserType = {
          id: authUser.id,
          name: authUser.name || authUser.email,
          email: authUser.email,
          role: userType === 'admin' ? 'admin' : 'student',
          applicationStatus: authUser.applicationStatus
        };

        setUser(transformedUser);
        localStorage.setItem('currentUser', JSON.stringify(transformedUser));

        // Only redirect if we're on home/login page
        if (currentPage === 'home' || currentPage === 'login') {
          setCurrentPage(transformedUser.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
        }
        return;
      }

      // Priority 2: Check localStorage for existing session
      const storedUser = localStorage.getItem('user');
      const storedUserType = localStorage.getItem('userType');
      const currentUser = localStorage.getItem('currentUser');

      if (storedUser && storedUserType) {
        try {
          const userData = JSON.parse(storedUser);
          const role: 'student' | 'admin' = storedUserType === 'admin' ? 'admin' : 'student';
          
          const transformedUser: UserType = {
            id: userData.id,
            name: userData.name || userData.email,
            email: userData.email,
            role: role,
            applicationStatus: userData.applicationStatus
          };

          setUser(transformedUser);
          
          if (currentPage === 'home' || currentPage === 'login') {
            setCurrentPage(role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      } 
      else if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          setUser(userData);
          
          if (currentPage === 'home' || currentPage === 'login') {
            setCurrentPage(userData.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
          }
        } catch (error) {
          console.error('Error parsing currentUser:', error);
        }
      }
    };

    syncUserAndPage();
  }, [authUser, userType, currentPage]);

  const handleLogin = (userData: UserType) => {
    const userWithName = {
        ...userData,
        name: userData.name || userData.email.split('@')[0] || 'Student'
    };
    
    setUser(userWithName);
    localStorage.setItem('currentUser', JSON.stringify(userWithName));
    
    if (userData.role === 'admin') {
        setCurrentPage('admin-dashboard');
    } else {
        setCurrentPage('student-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    authLogout(); // Use AuthContext's logout
    localStorage.removeItem('currentUser');
    setCurrentPage('home');
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const renderPage = () => {
    const pageContent = (() => {
      switch (currentPage) {
        case 'home':
          return <HomePage onNavigate={setCurrentPage} />;
        case 'courses':
          return <CourseCatalog onNavigate={setCurrentPage} user={user} />;
        case 'login':
          return <LoginPage onLogin={handleLogin} onNavigate={setCurrentPage} />;
        case 'student-dashboard':
          return <StudentDashboard user={user} onNavigate={setCurrentPage} />;
        case 'admin-dashboard':
          return <AdminDashboard user={user} onNavigate={setCurrentPage} />;
        case 'application':
          return <ApplicationForm user={user} onNavigate={setCurrentPage} />;
        case 'profile':
          return <ProfilePage user={user} onNavigate={setCurrentPage} />;
        default:
          return <HomePage onNavigate={setCurrentPage} />;
      }
    })();

    if (currentPage === 'application') {
      return (
        <ApplicationProvider token={getAuthToken() || undefined}>
          {pageContent}
        </ApplicationProvider>
      );
    }

    return pageContent;
  };

  const getNavItems = (): NavItem[] => {
    if (!user) {
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'login', label: 'Login', icon: User },
      ];
    }
    if (user.role === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'Dashboard', icon: Users },
        { id: 'profile', label: 'Profile', icon: UserCircle },
      ];
    }
    return [
      { id: 'student-dashboard', label: 'Dashboard', icon: GraduationCap },
      { id: 'courses', label: 'Courses', icon: BookOpen },
      { id: 'application', label: 'Apply', icon: FileText },
      { id: 'profile', label: 'Profile', icon: UserCircle },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setCurrentPage('home')}
            >
              <GraduationCap className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">EduPortal</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {getNavItems().map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Menu / Login */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Hello, {user.role}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentPage('login')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {getNavItems().map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{renderPage()}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">EduPortal</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering students through quality education and innovative learning experiences. 
                Join thousands of successful graduates who started their journey with us.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setCurrentPage('courses')} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Courses
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('login')} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Admissions
                  </button>
                </li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <p>1H Education Street</p>
                <p>LIC opposite, Tirunelveli.</p>
                <p>Phone: (+91) 9876543212</p>
                <p>Email: info@eduportal.edu</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EduPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppContent;