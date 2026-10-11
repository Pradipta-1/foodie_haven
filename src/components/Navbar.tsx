import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, ChefHat, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { itemCount, toggleCartDrawer } = useCart();
  const [isCartBumping, setIsCartBumping] = useState(false);

  useEffect(() => {
    if (itemCount === 0) return;
    setIsCartBumping(true);
    const timer = setTimeout(() => setIsCartBumping(false), 450);
    return () => clearTimeout(timer);
  }, [itemCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/admin" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-1.5 sm:p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent block leading-tight">
                    Foodie Haven
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider text-accent-700 bg-accent-100 px-1.5 sm:px-2 py-0.5 rounded-full inline-block">
                    Admin Portal 👑
                  </span>
                </div>
              </Link>
            </div>

            {/* Admin Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-gray-100/90 rounded-full text-[11px] font-semibold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Console · Restaurant Management</span>
            </div>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[120px] md:max-w-none">
                    {user?.fullName || 'Admin User'}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-none mt-1 truncate max-w-[120px] md:max-w-none">
                    {user?.email || 'admin@foodiehaven.com'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-xl transition-all shadow-xs"
                title="Logout from Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-1.5 sm:p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Foodie Haven
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors hover:text-primary-600 relative py-1 text-sm xl:text-base ${
                  isActive(link.path) ? 'text-primary-600 font-semibold' : 'text-gray-700'
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
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Admin</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={toggleCartDrawer}
              data-no-overflow="true"
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 text-gray-700 hover:text-primary-600 focus:outline-none"
              aria-label="Shopping cart"
            >
              <div className={`relative inline-flex items-center justify-center transition-transform duration-300 ${isCartBumping ? 'scale-110' : ''}`}>
                <ShoppingCart className={`w-6 h-6 transition-colors ${itemCount > 0 ? 'text-primary-600' : 'text-gray-700'}`} />
                {itemCount > 0 && (
                  <span
                    key={itemCount}
                    className="absolute -top-1.5 -right-2 bg-gradient-to-r from-accent-600 to-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center leading-none shadow-sm ring-2 ring-white animate-scale-in select-none pointer-events-none"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div className="flex items-center gap-2.5">
                <Link to="/login" className="btn-outline py-2 px-3.5 text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions: Cart + Log In & Sign Up (Replaces Hamburger Menu) */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cart Button */}
            <button
              onClick={toggleCartDrawer}
              data-no-overflow="true"
              className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 text-gray-700 hover:text-primary-600 focus:outline-none"
              aria-label="Shopping cart"
            >
              <div className={`relative inline-flex items-center justify-center transition-transform duration-300 ${isCartBumping ? 'scale-110' : ''}`}>
                <ShoppingCart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${itemCount > 0 ? 'text-primary-600' : 'text-gray-700'}`} />
                {itemCount > 0 && (
                  <span
                    key={itemCount}
                    className="absolute -top-1.5 -right-2 bg-gradient-to-r from-accent-600 to-red-600 text-white text-[10px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center leading-none shadow-sm ring-2 ring-white animate-scale-in select-none pointer-events-none"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
            </button>

            {/* Mobile Auth Actions: Sign Up & Log In (Replaces hamburger menu) */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center p-0.5 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                  aria-label="User profile"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="font-bold text-gray-900 text-xs truncate">{user.fullName}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                      >
                        <Package className="w-4 h-4 text-gray-500" />
                        <span>My Orders</span>
                      </Link>
                      <hr className="my-1.5 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors whitespace-nowrap active:scale-95"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-2.5 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-xs transition-colors whitespace-nowrap active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
