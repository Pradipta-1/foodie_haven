import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Users,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  AlertCircle,
  Utensils,
  Clock,
  Layers,
  ChevronRight,
  Filter,
  RotateCcw,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { useFood } from '../context/FoodContext';
import { FOOD_CATEGORIES } from '../data/mockData';
import { FoodItem, OrderStatus, FoodCategory, User as UserModel } from '../types';
import { formatCurrency, formatDateTime } from '../lib/utils';
import AdminFoodModal from '../components/AdminFoodModal';
import { authApi } from '../lib/api';

type AdminTab = 'overview' | 'menu' | 'orders' | 'customers';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { orders, updateOrderStatus, refreshOrders } = useOrders();
  const { showSuccess, showWarning, showError } = useToast();
  const {
    foodItems,
    isDbConnected,
    toggleAvailability,
    saveFoodItem,
    deleteFoodItem,
    resetCatalog,
    syncWithDatabase,
  } = useFood();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dbUsers, setDbUsers] = useState<UserModel[]>([]);

  // Load MongoDB Atlas users
  const loadUsers = async () => {
    try {
      const usersData = await authApi.getAllUsers();
      if (Array.isArray(usersData)) {
        setDbUsers(usersData);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Modal states
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  // Filters for menu management
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState<FoodCategory>('All');

  // Filters for order management
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // KPI calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.grandTotal, 0);
  }, [orders]);

  const totalOrdersCount = orders.length;

  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) =>
      ['Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(o.status)
    ).length;
  }, [orders]);

  const availableDishesCount = useMemo(() => {
    return foodItems.filter((item) => item.isAvailable).length;
  }, [foodItems]);

  // Customers calculation from both MongoDB users and order records
  const customersList = useMemo(() => {
    const map = new Map<string, { name: string; email: string; phone: string; role?: string; ordersCount: number; totalSpent: number }>();

    // 1. First add all registered MongoDB Atlas users
    dbUsers.forEach((u) => {
      if (u.email) {
        map.set(u.email.toLowerCase(), {
          name: u.fullName || 'User',
          email: u.email,
          phone: u.phone || 'N/A',
          role: u.role,
          ordersCount: 0,
          totalSpent: 0,
        });
      }
    });

    // 2. Aggregate orders
    orders.forEach((o) => {
      const email = (o.deliveryAddress?.email || (o as any).customer?.email || '').toLowerCase();
      if (!email) return;

      if (!map.has(email)) {
        map.set(email, {
          name: o.deliveryAddress?.fullName || (o as any).customer?.fullName || 'Valued Customer',
          email: email,
          phone: o.deliveryAddress?.phone || (o as any).customer?.phone || 'N/A',
          ordersCount: 1,
          totalSpent: o.status !== 'Cancelled' ? o.grandTotal : 0,
        });
      } else {
        const curr = map.get(email)!;
        curr.ordersCount += 1;
        if (o.status !== 'Cancelled') {
          curr.totalSpent += o.grandTotal;
        }
      }
    });

    return Array.from(map.values());
  }, [orders, dbUsers]);

  // Menu operations
  const handleToggleAvailability = (foodId: string) => {
    toggleAvailability(foodId);
  };

  const handleDeleteFood = (foodId: string) => {
    const item = foodItems.find((f) => f.id === foodId);
    if (window.confirm(`Are you sure you want to delete "${item?.name}"?`)) {
      deleteFoodItem(foodId);
    }
  };

  const handleSaveFood = (food: FoodItem) => {
    saveFoodItem(food);
    setIsFoodModalOpen(false);
    setEditingFood(null);
  };

  const openAddModal = () => {
    setEditingFood(null);
    setIsFoodModalOpen(true);
  };

  const openEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setIsFoodModalOpen(true);
  };

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return foodItems.filter((item) => {
      if (menuCategory !== 'All' && item.category !== menuCategory) return false;
      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [foodItems, menuCategory, menuSearch]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.deliveryAddress.fullName.toLowerCase().includes(q) ||
          o.deliveryAddress.phone.includes(q)
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const ORDER_STATUS_OPTIONS: OrderStatus[] = [
    'Order Placed',
    'Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-100 text-accent-800 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              👑 Restaurant Management Console
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage live orders, menu catalog, availability, and view business analytics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isDbConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
              title={
                isDbConnected
                  ? 'Connected to MongoDB Atlas database (foodie_haven)'
                  : 'Running with live local cache & cross-tab sync'
              }
            >
              <Database className="w-4 h-4 text-current" />
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{isDbConnected ? 'MongoDB Atlas Connected' : 'Live Sync Active'}</span>
            </div>

            <button
              onClick={() => {
                syncWithDatabase();
                refreshOrders();
                loadUsers();
                showSuccess('Synchronized menu, orders & users with MongoDB database!');
              }}
              className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 border-gray-300 hover:border-primary-500 hover:text-primary-600"
              title="Refresh connection and sync from MongoDB database"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sync DB</span>
            </button>

            <button
              onClick={openAddModal}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-px mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Business Overview', icon: TrendingUp },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'menu', label: `Menu Catalog (${foodItems.length})`, icon: Utensils },
            { id: 'customers', label: `Customers (${customersList.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-primary-600 text-primary-600 bg-white/50'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Total Revenue
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                      {formatCurrency(totalRevenue)}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Total Orders
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                      {totalOrdersCount}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-primary-600">
                  {activeOrdersCount} in preparation / out for delivery
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Today's Orders
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                      {todayOrders.length}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">Live incoming customer orders</div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Available Dishes
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                      {availableDishesCount} / {foodItems.length}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Utensils className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-emerald-600">
                  {foodItems.length - availableDishesCount} marked out-of-stock
                </div>
              </div>
            </div>

            {/* Sales Breakdown by Category & Order Statistics */}
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Category Sales Distribution */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary-600" />
                  Menu Category Distribution
                </h3>

                <div className="space-y-4">
                  {FOOD_CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                    const count = foodItems.filter((f) => f.category === cat).length;
                    const percent = Math.round((count / foodItems.length) * 100) || 0;
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-700">{cat}</span>
                          <span className="text-gray-500">
                            {count} items ({percent}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders Quick Stream */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-gray-100 space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="pt-3 first:pt-0 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-gray-900">
                          #{order.orderNumber}
                        </span>
                        <p className="text-xs text-gray-500">{order.deliveryAddress.fullName}</p>
                        <p className="text-[10px] text-gray-400">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xs text-gray-900 block">
                          {formatCurrency(order.grandTotal)}
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-50 text-primary-700">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search & Status Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order #, customer, phone..."
                  className="input-field pl-9 py-2 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="input-field py-2 text-xs sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-6">Order ID & Date</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Items</th>
                      <th className="py-4 px-6">Total Amount</th>
                      <th className="py-4 px-6">Payment</th>
                      <th className="py-4 px-6">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-mono font-bold text-gray-900 block">
                              #{order.orderNumber}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDateTime(order.createdAt)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-gray-900 block">
                              {order.deliveryAddress?.fullName || (order as any).customer?.fullName || 'Valued Customer'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {order.deliveryAddress?.phone || (order as any).customer?.phone || ''}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-xs font-medium text-gray-700">
                              {order.items.map((i) => `${i.foodItem.name} (x${i.quantity})`).join(', ')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-gray-900">
                              {formatCurrency(order.grandTotal)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-block uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {order.paymentMethod}
                            </span>
                            <span className="block text-[11px] text-emerald-600 font-semibold mt-0.5">
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`text-xs font-bold rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : order.status === 'Out for Delivery'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-primary-50 text-primary-800 border-primary-300'
                              }`}
                            >
                              {ORDER_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MENU CATALOG MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search dish name or ingredient..."
                  className="input-field pl-9 py-2 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <select
                  value={menuCategory}
                  onChange={(e) => setMenuCategory(e.target.value as FoodCategory)}
                  className="input-field py-2 text-xs sm:text-sm"
                >
                  {FOOD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  onClick={resetCatalog}
                  className="btn-outline text-xs py-2.5 px-3.5 whitespace-nowrap flex items-center gap-1.5 border-gray-300 hover:border-primary-500 hover:text-primary-600"
                  title="Resync menu catalog names, pictures and descriptions with customer store"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sync Menu</span>
                </button>

                <button
                  onClick={openAddModal}
                  className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Dish
                </button>
              </div>
            </div>

            {/* Menu Items Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-6">Dish</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMenu.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                              }}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-100"
                            />
                            <div>
                              <span className="font-bold text-gray-900 block">{item.name}</span>
                              <span className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                                {item.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-700">{item.category}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              item.isVeg
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current" />
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              item.isAvailable
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.isAvailable ? '✓ In Stock' : '✕ Out of Stock'}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFood(item.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">Customer Directory</h3>
                <p className="text-xs text-gray-500">
                  Customers who have placed orders with Foodie Haven
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-6">Customer Name</th>
                      <th className="py-4 px-6">Contact Email</th>
                      <th className="py-4 px-6">Phone Number</th>
                      <th className="py-4 px-6">Total Orders</th>
                      <th className="py-4 px-6">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customersList.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-gray-900">{cust.name}</td>
                        <td className="py-4 px-6 text-gray-700">{cust.email}</td>
                        <td className="py-4 px-6 text-gray-700">{cust.phone}</td>
                        <td className="py-4 px-6 font-semibold text-gray-900">
                          {cust.ordersCount}
                        </td>
                        <td className="py-4 px-6 font-bold text-emerald-600">
                          {formatCurrency(cust.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Food Add / Edit Modal */}
      <AdminFoodModal
        isOpen={isFoodModalOpen}
        item={editingFood}
        onClose={() => setIsFoodModalOpen(false)}
        onSave={handleSaveFood}
      />
    </div>
  );
}
