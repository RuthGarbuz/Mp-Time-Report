import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Lock, User, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import type { LoginFormData, SecurityState, UiState } from '../interface/interfaces';
import "tailwindcss";
// interface FormData {
//   email: string;
//   password: string;
//   rememberMe: boolean;
// }

// interface SecurityState {
//   attempts: number;
//   isLocked: boolean;
//   lockTime: Date | null;
//   showCaptcha: boolean;
// }

// interface UiState {
//   showPassword: boolean;
//   isLoading: boolean;
//   errors: { [key: string]: string }; // OR more specific: errors: Partial<Record<keyof FormData, string>>;
//   message: string;
//   isSuccess: boolean;
// }
// const MainPage = () => (
//   <div className="min-h-screen flex items-center justify-center text-3xl font-bold">
//     Welcome to the Main Page!
//   </div>
// );

const LoginPage: React.FC =  () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',password: '', rememberMe: false,
  });

  const [security, setSecurity] = useState<SecurityState>({
    attempts: 0,isLocked: false,lockTime: null,showCaptcha: false
  });

  const [ui, setUi] = useState<UiState>({
    showPassword: false,isLoading: false, errors: {}, message: '', isSuccess: false
  });

  // Security: Lock account after 3 failed attempts
  useEffect(() => {
    if (security.isLocked && security.lockTime) {
      const timer = setTimeout(() => {
        setSecurity(prev => ({
          ...prev,
          isLocked: false,
          attempts: 0,
          lockTime: null
        }));
        setUi(prev => ({
          ...prev,
          message: 'Account unlocked. You can try again.',
          errors: {}
        }));
      }, 30000); // 30 seconds lockout

      return () => clearTimeout(timer);
    }
  }, [security.isLocked, security.lockTime]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string | any[]) => {
    return password.length >= 6;
  };

  const handleInputChange = (e: { target: { name: any; value: any; type: any; checked: any; }; }) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (ui.errors[name]) {
      setUi(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: '' }
      }));
    }
  };


const handleSubmit = async (e: { preventDefault: () => void; }) => {
  e.preventDefault();

  if (security.isLocked) {
    setUi(prev => ({
      ...prev,
      message: 'Account temporarily locked due to multiple failed attempts. Please wait.'
    }));
    return;
  }

const errors: Partial<Record<keyof LoginFormData, string>> = {};
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'הכנס בבקשה אימייל תקין';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'סיסמה חייבת להיות עם לפחות 6 תווים';
  }

  if (Object.keys(errors).length > 0) {
    setUi(prev => ({ ...prev, errors }));
    return;
  }

  setUi(prev => ({ ...prev, isLoading: true, message: '' }));

  try {
    const result = await authService.login(formData.email, formData.password);

    if (result.success) {
        console.log('success'); 
      const { data } = result;

      // ✅ שמירה ל-sessionStorage
      sessionStorage.setItem('user', JSON.stringify(data));

      setUi(prev => ({
        ...prev,
        isLoading: false,
        message: 'Login successful! Redirecting...',
        errors: {},
        isSuccess: true
      }));

      setSecurity(prev => ({ ...prev, attempts: 0 }));

      setTimeout(() => {
        navigate('/main');
      }, 1500);
    } else {
       console.log('not success'); 
      const newAttempts = security.attempts + 1;
      const shouldLock = newAttempts >= 3;

      setSecurity(prev => ({
        ...prev,
        attempts: newAttempts,
        isLocked: shouldLock,
        lockTime: shouldLock ? new Date() : null, 
        showCaptcha: newAttempts >= 2
      }));

      setUi(prev => ({
        ...prev,
        isLoading: false,
        message: result.message || 'Login failed.',
        errors: { general: result.message || 'Invalid email or password' },
        isSuccess: false
      }));
    }
  } catch (error) {
    console.error('Login error:', error);
    setUi(prev => ({
      ...prev,
      isLoading: false,
      message: 'An unexpected error occurred.',
      errors: { general: 'Network or server error.' },
      isSuccess: false
    }));
  }
};

  const SecurityPanel = () => (
    
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
    
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-800">מצב אבטחה</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {security.attempts === 0 ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          )}
          <span className="text-gray-700">Failed attempts: <span className="font-medium">{security.attempts}/3</span></span>
        </div>
        
        <div className="flex items-center gap-2">
          {security.isLocked ? (
            <Lock className="w-4 h-4 text-red-500" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          <span className="text-gray-700">Account status: <span className="font-medium">{security.isLocked ? 'Locked' : 'Active'}</span></span>
        </div>
        
        {security.showCaptcha && !security.isLocked && (
          <div className="mt-3 p-3 bg-yellow-100 rounded-lg text-yellow-800 border border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">CAPTCHA verification required for next attempt</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-10 left-1/3 w-36 h-36 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">LOGIN</h1>
              <p className="text-purple-100">ברוכים השבים! אנא התחבר כדי להמשיך.</p>
            </div>
          </div>
          
          {/* Security Panel */}
          <div className="p-6 pb-0">
            <SecurityPanel />
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-6">
            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                כתובת אימייל 
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    ui.errors.email 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-300 focus:ring-purple-200 focus:border-purple-400 bg-gray-50 hover:bg-white'
                  }`}
                  placeholder="הזן את כתובת האימייל שלך."
                  disabled={security.isLocked}
                />
              </div>
              {ui.errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {ui.errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                סיסמה
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type={ui.showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    ui.errors.password 
                      ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-300 focus:ring-purple-200 focus:border-purple-400 bg-gray-50 hover:bg-white'
                  }`}
                  placeholder="הזן את הסיסמה שלך"
                  disabled={security.isLocked}
                />
                <button
                  type="button"
                  onClick={() => setUi(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors p-1"
                  disabled={security.isLocked}
                >
                  {ui.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {ui.errors.password && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {ui.errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-200 focus:ring-2"
                  disabled={security.isLocked}
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
                  תזכור אותי
                </span>
              </label>
              
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                onClick={() => alert('Forgot password functionality would be implemented here')}
              >
                שכחת סיסמא?
              </button>
            </div>

            {/* Messages */}
            {ui.message && (
              <div className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                ui.isSuccess
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {ui.isSuccess ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {ui.message}
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={ui.isLoading || security.isLocked}
              className={`w-full py-4 px-4 rounded-xl font-bold text-white text-lg transition-all duration-200 ${
                ui.isLoading || security.isLocked
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95 shadow-lg hover:shadow-xl'
              }`}
            >
              {ui.isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : security.isLocked ? (
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Account Locked
                </div>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;