import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  updateProfile: (data: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // 1. Check tab-isolated sessionStorage first (preserves account on refresh in the current tab)
    if (typeof sessionStorage !== 'undefined') {
      const sessionUser = sessionStorage.getItem('foodie_session_user') || sessionStorage.getItem('user');
      if (sessionUser) {
        try {
          return JSON.parse(sessionUser);
        } catch (e) {}
      }
    }

    // 2. Fallback to localStorage if opening fresh tab
    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('foodie_session_user') || localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('foodie_session_user', storedUser);
            sessionStorage.setItem('user', storedUser);
          }
          return parsed;
        } catch (e) {}
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('foodie_session_user', JSON.stringify(user));
        sessionStorage.setItem('user', JSON.stringify(user));
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('foodie_session_user', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));
      }
    } else {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('foodie_session_user');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('foodie_session_token');
        sessionStorage.removeItem('token');
      }
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    // 1. Try backend MongoDB API first
    try {
      const data = await authApi.login(email, password);
      if (data) {
        const loggedUser: User = {
          id: data.id || data._id || `user-${Date.now()}`,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || '',
          role: data.role || 'customer',
          createdAt: data.createdAt || new Date().toISOString(),
          savedAddresses: data.savedAddresses || [],
        };
        setUser(loggedUser);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('foodie_session_user', JSON.stringify(loggedUser));
          sessionStorage.setItem('user', JSON.stringify(loggedUser));
        }
        return { success: true, user: loggedUser };
      }
    } catch (apiErr) {
      // Backend offline or local fallback
    }

    // 2. Built-in Admin credentials fallback
    if (email.toLowerCase() === 'admin@foodiehaven.com') {
      const adminUser: User = {
        id: 'admin-1',
        fullName: 'Admin User',
        email: 'admin@foodiehaven.com',
        phone: '+91 98765 00000',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('foodie_session_user', JSON.stringify(adminUser));
        sessionStorage.setItem('user', JSON.stringify(adminUser));
      }
      return { success: true, user: adminUser };
    }

    // 3. Demo customer credentials fallback
    if (email.toLowerCase() === 'demo@example.com') {
      const demoCustomer: User = {
        id: 'user-demo-1',
        fullName: 'Rahul Sharma',
        email: 'demo@example.com',
        phone: '+91 98765 43210',
        role: 'customer',
        createdAt: new Date().toISOString(),
        savedAddresses: [
          {
            fullName: 'Rahul Sharma',
            phone: '+91 98765 43210',
            email: 'demo@example.com',
            houseNumber: 'Flat 402, Sunshine Apts',
            street: '12th Main, Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560038',
          },
        ],
      };
      setUser(demoCustomer);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('foodie_session_user', JSON.stringify(demoCustomer));
        sessionStorage.setItem('user', JSON.stringify(demoCustomer));
      }
      return { success: true, user: demoCustomer };
    }

    // 4. Stored local users fallback
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    const foundUser = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }

    setUser(foundUser);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('foodie_session_user', JSON.stringify(foundUser));
      sessionStorage.setItem('user', JSON.stringify(foundUser));
    }
    return { success: true, user: foundUser };
  };

  const register = async (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    // 1. Try backend MongoDB API
    try {
      const data = await authApi.register(fullName, email, phone, password);
      if (data) {
        const newUser: User = {
          id: data.id || data._id || `user-${Date.now()}`,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          role: data.role || 'customer',
          createdAt: new Date().toISOString(),
          savedAddresses: [],
        };
        setUser(newUser);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('foodie_session_user', JSON.stringify(newUser));
          sessionStorage.setItem('user', JSON.stringify(newUser));
        }
        return { success: true, user: newUser };
      }
    } catch (apiErr) {
      // fallback
    }

    // 2. Local storage fallback
    const storedUsers = localStorage.getItem('users');
    const users = storedUsers ? JSON.parse(storedUsers) : [];

    if (users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'User with this email already exists' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      phone,
      role: 'customer',
      createdAt: new Date().toISOString(),
      savedAddresses: [],
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setUser(newUser);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('foodie_session_user', JSON.stringify(newUser));
      sessionStorage.setItem('user', JSON.stringify(newUser));
    }

    return { success: true, user: newUser };
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('foodie_session_user', JSON.stringify(updatedUser));
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }

    try {
      if (data.fullName && data.phone) {
        await authApi.updateProfile(data.fullName, data.phone);
      }
    } catch (e) {}

    // Update in local users
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        const idx = users.findIndex((u: User) => u.email.toLowerCase() === user.email.toLowerCase());
        if (idx > -1) {
          users[idx] = updatedUser;
          localStorage.setItem('users', JSON.stringify(users));
        }
      } catch (e) {}
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('foodie_session_user');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('foodie_session_token');
      sessionStorage.removeItem('token');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('foodie_session_user');
      localStorage.removeItem('user');
      localStorage.removeItem('foodie_session_token');
      localStorage.removeItem('token');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
