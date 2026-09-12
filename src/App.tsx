import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { FoodProvider } from './context/FoodContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import FoodDetailsPage from './pages/FoodDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin Route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { isAdmin } = useAuth();

  // Dedicated Admin Interface: Admins ONLY see the Admin Dashboard
  if (isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Redirect any other path (/, /menu, /cart, /checkout, etc.) directly to /admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Customer Interface
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/food/:id" element={<FoodDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Cart & Checkout */}
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Customer Routes */}
          <Route
            path="/order-confirmation/:orderId"
            element={
              <ProtectedRoute>
                <OrderConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect for customers */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <FoodProvider>
            <CartProvider>
              <OrderProvider>
                <AppContent />
              </OrderProvider>
            </CartProvider>
          </FoodProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
