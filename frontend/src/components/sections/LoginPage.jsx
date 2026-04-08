import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, UserCircle, Shield, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('patient'); // 'patient' or 'admin'
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle admin toggle with prefilled credentials
  const handleUserTypeToggle = (type) => {
    setUserType(type);
    if (type === 'admin') {
      setFormData({
        email: 'admin@gmail.com',
        password: 'admin123'
      });
    } else {
      setFormData({
        email: '',
        password: ''
      });
    }
    // Clear errors when toggling
    setErrors({});
    setTouched({});
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name);
  };

  // Validate individual field
  const validateField = (fieldName) => {
    let error = '';
    
    switch(fieldName) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) error = 'Email is required';
        else if (!emailRegex.test(formData.email)) error = 'Please enter a valid email address';
        break;
        
      case 'password':
        if (!formData.password) error = 'Password is required';
        else if (formData.password.length < 6) error = 'Password must be at least 6 characters';
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const emailError = validateField('email');
    const passwordError = validateField('password');
    return !emailError && !passwordError;
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  setTouched({ email: true, password: true });

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Save token + user
    localStorage.setItem("token", data.token);
    localStorage.setItem("currentUser", JSON.stringify(data.user));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", data.user.role);

    // Redirect based on role
    if (data.user.role === "admin") {
      navigate("/doctors");
    } else {
      navigate("/");
    }

  } catch (err) {
    setErrors({ general: err.message });
  } finally {
    setIsLoading(false);
    window.location.reload()

  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-md mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-3">
            Welcome <span className="text-gradient">Back</span>
          </h1>
          <p className="text-[#64748B]">
            Login to manage your healthcare journey
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-sky-100 p-6">
          <div className="flex gap-3 mb-6 bg-[#F1F5F9] rounded-xl p-1">
            <button
              type="button"
              onClick={() => handleUserTypeToggle('patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                userType === 'patient'
                  ? 'bg-gradient-to-r from-[#378ADD] to-[#0EA5E9] text-white shadow-md'
                  : 'text-[#64748B] hover:text-[#378ADD]'
              }`}
            >
              <UserCircle size={18} />
              Patient Login
            </button>
            <button
              type="button"
              onClick={() => handleUserTypeToggle('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                userType === 'admin'
                  ? 'bg-gradient-to-r from-[#378ADD] to-[#0EA5E9] text-white shadow-md'
                  : 'text-[#64748B] hover:text-[#378ADD]'
              }`}
            >
              <Shield size={18} />
              Admin Login
            </button>
          </div>

          {/* Demo Credentials Hint */}
          {userType === 'admin' && (
            <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-700 flex items-center gap-2">
                <Shield size={14} />
                Demo Admin Credentials pre-filled
              </p>
            </div>
          )}

          {userType === 'patient' && (
            <div className="mb-4 p-3 bg-sky-50 rounded-xl border border-sky-200">
              <p className="text-xs text-sky-700">
                💡 Demo Patient: patient@gmail.com / patient123
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.email && errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.password && errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#378ADD]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-[#378ADD] hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#378ADD] to-[#0EA5E9] text-white font-semibold rounded-xl hover:from-[#185FA5] hover:to-[#378ADD] transition-all duration-300 shadow-lg shadow-sky-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>

            {/* Signup Link */}
            <p className="text-center text-sm text-[#64748B]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#378ADD] font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;