import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Home, 
   Building,
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
      case 'fullName':
        if (!formData.fullName.trim()) error = 'Full name is required';
        else if (formData.fullName.trim().length < 3) error = 'Name must be at least 3 characters';
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) error = 'Email is required';
        else if (!emailRegex.test(formData.email)) error = 'Please enter a valid email address';
        break;
        
      case 'password':
        if (!formData.password) error = 'Password is required';
        else if (formData.password.length < 6) error = 'Password must be at least 6 characters';
        else if (!/(?=.*[A-Z])/.test(formData.password)) error = 'Password must contain at least one uppercase letter';
        else if (!/(?=.*[0-9])/.test(formData.password)) error = 'Password must contain at least one number';
        break;
        
      case 'confirmPassword':
        if (!formData.confirmPassword) error = 'Please confirm your password';
        else if (formData.confirmPassword !== formData.password) error = 'Passwords do not match';
        break;
        
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.phone) error = 'Phone number is required';
        else if (!phoneRegex.test(formData.phone)) error = 'Please enter a valid 10-digit phone number';
        break;
        
      case 'address':
        if (!formData.address.trim()) error = 'Address is required';
        break;
        
      case 'city':
        if (!formData.city.trim()) error = 'City is required';
        break;
        
      case 'state':
        if (!formData.state.trim()) error = 'State is required';
        break;
        
      case 'pincode':
        const pincodeRegex = /^[0-9]{6}$/;
        if (!formData.pincode) error = 'Pincode is required';
        else if (!pincodeRegex.test(formData.pincode)) error = 'Please enter a valid 6-digit pincode';
        break;
        
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const fieldsToValidate = ['fullName', 'email', 'password', 'confirmPassword', 'phone', 'address', 'city', 'state', 'pincode'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field);
      if (error) isValid = false;
    });
    
    return isValid;
  };

  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  const allFields = ['fullName', 'email', 'password'];
  const touchedObj = {};
  allFields.forEach(field => touchedObj[field] = true);
  setTouched(touchedObj);

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "patient"
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }

    // Save token + user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    navigate("/signin");

  } catch (err) {
    console.error(err.message);
    alert(err.message);
  } finally {
    setIsLoading(false);
    window.location.reload()
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0F172A] mb-3">
            Create <span className="text-gradient">Account</span>
          </h1>
          <p className="text-[#64748B]">
            Join MediCare to book appointments with top doctors
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-sky-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.fullName && errors.fullName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                  }`}
                />
              </div>
              {touched.fullName && errors.fullName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Email Address <span className="text-red-500">*</span>
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
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Create a password"
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
              {touched.password && !errors.password && formData.password && (
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Strong password
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.confirmPassword && errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#378ADD]"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    touched.phone && errors.phone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                  }`}
                />
              </div>
              {touched.phone && errors.phone && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Home size={18} className="absolute left-3 top-3 text-[#94A3B8]" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Street address, apartment, etc."
                  rows="2"
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                    touched.address && errors.address 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                      : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                  }`}
                />
              </div>
              {touched.address && errors.address && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.address}
                </p>
              )}
            </div>

            {/* City, State, Pincode Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="City"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      touched.city && errors.city 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                    }`}
                  />
                </div>
                {touched.city && errors.city && (
                  <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="State"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      touched.state && errors.state 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                    }`}
                  />
                </div>
                {touched.state && errors.state && (
                  <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      touched.pincode && errors.pincode 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-[#E2E8F0] focus:border-[#378ADD] focus:ring-sky-200'
                    }`}
                  />
                </div>
                {touched.pincode && errors.pincode && (
                  <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#378ADD] to-[#0EA5E9] text-white font-semibold rounded-xl hover:from-[#185FA5] hover:to-[#378ADD] transition-all duration-300 shadow-lg shadow-sky-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                'Sign Up'
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-[#64748B]">
              Already have an account?{' '}
              <Link to="/signin" className="text-[#378ADD] font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;