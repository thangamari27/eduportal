import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onLogin: (user: any, userType: 'user' | 'admin') => void;
  onNavigate: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const { smartLogin, login, adminLogin, register, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginMode, setLoginMode] = useState<'auto' | 'user' | 'admin'>('auto');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isLogin) {
        if (loginMode === 'auto') await smartLogin(formData.email, formData.password);
        else if (loginMode === 'admin') await adminLogin(formData.email, formData.password);
        else await login(formData.email, formData.password, 'user');
      } else {
        await register(formData.email, formData.phone, formData.password);
      }

      const storedUser = localStorage.getItem('user');
      const storedUserType = localStorage.getItem('userType') as 'user' | 'admin';
      if (storedUser && storedUserType) onLogin(JSON.parse(storedUser), storedUserType);
    } catch (error: any) {
      setErrors({ submit: error.message || 'An error occurred during authentication' });
    }
  };

  // const demoLogin = async (type: 'student' | 'admin') => {
  //   try {
  //     const demoCredentials = {
  //       student: { email: 'student@demo.com', password: 'password' },
  //       admin: { email: 'admin@demo.com', password: 'password' }
  //     };

  //     if (type === 'admin') await adminLogin(demoCredentials.admin.email, demoCredentials.admin.password);
  //     else await login(demoCredentials.student.email, demoCredentials.student.password, 'user');

  //     const storedUser = localStorage.getItem('user');
  //     const storedUserType = localStorage.getItem('userType') as 'user' | 'admin';
  //     if (storedUser && storedUserType) onLogin(JSON.parse(storedUser), storedUserType);
  //   } catch (error: any) {
  //     setErrors({ submit: error.message || 'Demo login failed' });
  //   }
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to access your dashboard' : 'Join thousands of successful students'}
            </p>
          </div>

          {isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Login As:</label>
              <div className="grid grid-cols-3 gap-2">
                {['auto', 'user', 'admin'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLoginMode(mode as 'auto' | 'user' | 'admin')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      loginMode === mode
                        ? mode === 'auto'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : mode === 'user'
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode === 'auto' ? 'Auto Detect' : mode === 'user' ? 'Student' : 'Admin'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {loginMode === 'auto'
                  ? 'System will automatically detect your account type'
                  : loginMode === 'user'
                  ? 'Logging in as student'
                  : 'Logging in as administrator'}
              </p>
            </div>
          )}

          {/* <div className="mb-6 space-y-2">
            <p className="text-sm text-gray-500 text-center mb-3">Quick Demo Access:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => demoLogin('student')}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => demoLogin('admin')}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                Demo Admin
              </button>
            </div>
            <div className="text-center text-gray-400 text-sm">or</div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Processing...'
                : isLogin
                ? `Sign In ${loginMode === 'auto' ? '' : `as ${loginMode === 'admin' ? 'Admin' : 'Student'}`}`
                : 'Create Student Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', name: '', phone: '', confirmPassword: '' });
                  setErrors({});
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                Forgot your password?
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
