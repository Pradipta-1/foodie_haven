import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, ChefHat, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { itemCount, toggleCartDrawer } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  // Dedicated Admin Navbar
  if (isAdmin) {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
        } border-b border-gray-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <ChefHat className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent block leading-tight">
                    Foodie Haven
                  </span>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-accent-700 bg-accent-100 px-2 py-0.5 rounded-full inline-block">
                    Admin Portal 👑
                  </span>
                </div>
              </Link>
            </div>

            {/* Admin Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-gray-100/90 rounded-full text-xs font-semibold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Console · Restaurant Management</span>
            </div>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none">
                    {user?.fullName || 'Admin User'}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-none mt-1">
                    {user?.email || 'admin@foodiehaven.com'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-xl transition-all shadow-xs"
                title="Logout from Admin"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <ChefHat className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Foodie Haven
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors hover:text-primary-600 relative ${
                  isActive(link.path) ? 'text-primary-600' : 'text-gray-700'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Admin</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={toggleCartDrawer}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-700 hidden xl:block">{user.fullName.split(' ')[0]}</span>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <Package className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">My Orders</span>
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Cart */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleCartDrawer}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Admin Dashboard</span>
              </Link>
            )}

            <hr className="my-3" />

            {isAuthenticated && user ? (
              <div className="space-y-1">
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span>My Orders</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Link to="/login" className="btn-outline w-full text-center">
                  Login
                </Link>
                <Link to="/register" className="btn-primary w-full text-center">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
