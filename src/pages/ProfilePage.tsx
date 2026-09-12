import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, LogOut, Package, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../lib/utils';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { getUserOrders } = useOrders();
  const { showSuccess, showWarning } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const orders = getUserOrders();
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.grandTotal, 0);
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    updateProfile({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
    });
    showSuccess('Profile updated successfully! 🎉');
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      showWarning('You have been logged out');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Stats Cards */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-3xl p-6 shadow-lg">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl font-black">{user.fullName.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-bold text-center mb-1">{user.fullName}</h2>
              <p className="text-sm text-white/80 text-center">{user.email}</p>
              <div className="mt-4 pt-4 border-t border-white/20 text-center">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase">
                  {user.role === 'admin' ? '👑 Admin' : '🍽️ Customer'}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Total Orders</p>
                    <p className="text-2xl font-black text-gray-900">{totalOrders}</p>
                  </div>
                  <Package className="w-10 h-10 text-primary-500" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Delivered</p>
                    <p className="text-2xl font-black text-emerald-600">{deliveredOrders}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-lg">
                    ✓
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Total Spent</p>
                    <p className="text-2xl font-black text-gray-900">{formatCurrency(totalSpent)}</p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline text-sm py-2 px-4"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-outline text-sm py-2 px-4"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium py-2 px-4 bg-gray-50 rounded-lg">
                      {user.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium py-2 px-4 bg-gray-50 rounded-lg">
                      {user.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium py-2 px-4 bg-gray-50 rounded-lg">
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-900">View My Orders</span>
                  </div>
                  <span className="text-xs text-gray-500">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Manage Addresses</span>
                  </div>
                  <span className="text-xs text-gray-500">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Change Password</span>
                  </div>
                  <span className="text-xs text-gray-500">→</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-600">Logout</span>
                  </div>
                  <span className="text-xs text-red-400">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
