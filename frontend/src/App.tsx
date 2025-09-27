// App.tsx
import React, { useState, useEffect } from 'react';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ApplicationProvider } from './contexts/ApplicationContext';
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

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<UserType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (userData: UserType) => {
  setUser(userData);
  localStorage.setItem('currentUser', JSON.stringify(userData));
  
  // Redirect based on role
  if (userData.role === 'admin') {
    setCurrentPage('admin-dashboard');
  } else {
    setCurrentPage('student-dashboard');
  }
};

  // Handle logout (clear session + redirect)
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken'); // Clear auth token as well
    setCurrentPage('home');
  };

  // Handle navigation with additional logic if needed
  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  // Get authentication token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Page rendering - wrapped with ApplicationProvider when needed
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
          // ApplicationForm is wrapped with ApplicationProvider
          return <ApplicationForm user={user} onNavigate={setCurrentPage} />;
        case 'profile':
          return <ProfilePage user={user} onNavigate={setCurrentPage} />;
        default:
          return <HomePage onNavigate={setCurrentPage} />;
      }
    })();

    // Wrap specific pages with ApplicationProvider if they need access to application context
    if (currentPage === 'application') {
      return (
        <ApplicationProvider token={getAuthToken() || undefined}>
          {pageContent}
        </ApplicationProvider>
      );
    }

    return pageContent;
  };

  // Alternative approach: Wrap the entire app with ApplicationProvider
  // This is cleaner if multiple components need access to application context
  const AppContent = () => (
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
                  <span className="text-sm text-gray-700">Welcome, {user.name}</span>
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

  // Navigation items based on role
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
    <AuthProvider>
      <ApplicationProvider token={getAuthToken() || undefined}>
        <AppContent />
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;