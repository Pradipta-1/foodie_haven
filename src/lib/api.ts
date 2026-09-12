import { FoodItem, Order, User, Coupon, OrderStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token (checks tab-isolated sessionStorage first, then localStorage)
const getAuthHeaders = () => {
  const token =
    (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('foodie_session_token') || sessionStorage.getItem('token')) : null) ||
    (typeof localStorage !== 'undefined' ? (localStorage.getItem('foodie_session_token') || localStorage.getItem('token')) : null);

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic fetch wrapper with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Health Check
export async function checkBackendHealth(): Promise<{ isOnline: boolean; message?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: 'GET' }, 2000);
    if (res.ok) {
      const data = await res.json();
      return { isOnline: true, message: data.message };
    }
    return { isOnline: false };
  } catch (e) {
    return { isOnline: false };
  }
}

// Auth API
export const authApi = {
  async register(fullName: string, email: string, phone: string, password: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    if (data.data?.token) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('foodie_session_token', data.data.token);
        sessionStorage.setItem('token', data.data.token);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('foodie_session_token', data.data.token);
        localStorage.setItem('token', data.data.token);
      }
    }
    return data.data;
  },

  async login(email: string, password: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    if (data.data?.token) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('foodie_session_token', data.data.token);
        sessionStorage.setItem('token', data.data.token);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('foodie_session_token', data.data.token);
        localStorage.setItem('token', data.data.token);
      }
    }
    return data.data;
  },

  async getMe() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async updateProfile(fullName: string, phone: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fullName, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async getAllUsers(): Promise<User[]> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },
};

// Food API
export const foodApi = {
  async getAll(): Promise<FoodItem[]> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/food`, { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async getById(id: string): Promise<FoodItem> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/food/${id}`, { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async create(food: Partial<FoodItem>): Promise<FoodItem> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/food`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(food),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async update(id: string, food: Partial<FoodItem>): Promise<FoodItem> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/food/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(food),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async toggleAvailability(id: string): Promise<FoodItem> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/food/${id}/availability`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/food/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
  },
};

// Order API
export const orderApi = {
  async create(orderData: any): Promise<Order> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async getMyOrders(email?: string): Promise<Order[]> {
    const url = email
      ? `${API_BASE_URL}/orders/my-orders?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/orders/my-orders`;
    const res = await fetchWithTimeout(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async getById(id: string): Promise<Order> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async cancel(id: string): Promise<Order> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },
};

// Coupon API
export const couponApi = {
  async getAll(): Promise<Coupon[]> {
    const res = await fetchWithTimeout(`${API_BASE_URL}/coupons`, { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },

  async validate(code: string, subtotal: number) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.data;
  },
};
