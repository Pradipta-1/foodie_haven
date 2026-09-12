import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (result.user?.role === 'admin' || formData.email.toLowerCase().includes('admin')) {
          showSuccess('Welcome Admin! Accessing Restaurant Dashboard 👑');
          navigate('/admin', { replace: true });
        } else {
          showSuccess('Welcome back! Login successful');
          navigate(from, { replace: true });
        }
      } else {
        showError(result.error || 'Login failed');
        setErrors({ form: result.error || 'Invalid credentials' });
      }
    } catch (error) {
      showError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'customer' | 'admin') => {
    setLoading(true);
    try {
      if (type === 'admin') {
        const result = await login('admin@foodiehaven.com', 'admin123');
        if (result.success) {
          showSuccess('Logged in as Admin 👑');
          navigate('/admin');
        }
      } else {
        const result = await login('demo@example.com', 'demo123');
        if (result.success) {
          showSuccess('Logged in as Rahul Sharma (Demo Customer) 🍽️');
          navigate(from, { replace: true });
        }
      }
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
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600 text-sm">
              Login to your account to continue ordering delicious food
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
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
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
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-gray-600 font-medium">Remember me</span>
              </label>
              <button type="button" className="text-primary-600 hover:text-primary-700 font-semibold">
                Forgot password?
              </button>
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
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-medium uppercase tracking-wider">
                Or
              </span>
            </div>
          </div>

          {/* Demo Logins */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer')}
              disabled={loading}
              className="w-full py-2.5 border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-700 rounded-xl font-semibold text-sm transition-all hover:bg-primary-50"
            >
              Try Demo Login (Customer)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="w-full py-2.5 border-2 border-gray-300 hover:border-accent-500 text-gray-700 hover:text-accent-700 rounded-xl font-semibold text-sm transition-all hover:bg-accent-50"
            >
              Login as Admin
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-bold">
              Sign Up
            </Link>
          </p>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-800 font-semibold mb-1">Demo Credentials:</p>
            <p className="text-xs text-blue-700">
              <strong>Admin:</strong> admin@foodiehaven.com / admin123
            </p>
            <p className="text-xs text-blue-700">
              <strong>Customer:</strong> Any registered email (use Sign Up first)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
