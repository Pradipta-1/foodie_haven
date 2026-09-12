import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await register(
        formData.fullName,
        formData.email,
        formData.phone,
        formData.password
      );

      if (result.success) {
        showSuccess('Account created successfully! Welcome to Foodie Haven 🎉');
        navigate('/');
      } else {
        showError(result.error || 'Registration failed');
        setErrors({ form: result.error || 'Registration failed' });
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-primary-50 via-orange-50 to-accent-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 text-sm">
              Join thousands of food lovers and start ordering today
            </p>
          </div>

          {/* Form Error */}
          {errors.form && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`input-field pl-12 ${errors.fullName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Rahul Sharma"
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`input-field pl-12 ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="rahul.sharma@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`input-field pl-12 ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="+91 98765 43210"
                />
              </div>
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`input-field pl-12 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Minimum 6 characters"
                />
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`input-field pl-12 ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                  placeholder="Re-enter your password"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className={`w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 mt-0.5 ${
                    errors.agreeToTerms ? 'border-red-500' : ''
                  }`}
                />
                <span className="text-xs text-gray-600">
                  I agree to the{' '}
                  <button type="button" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Terms & Conditions
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.agreeToTerms && <p className="text-xs text-red-600 mt-1">{errors.agreeToTerms}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
