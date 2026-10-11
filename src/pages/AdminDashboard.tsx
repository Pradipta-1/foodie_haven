import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  ExternalLink,
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

const CATEGORY_EMOJIS: Record<string, string> = {
  Burgers: '🍔',
  Pizza: '🍕',
  Pasta: '🍝',
  Biryani: '🍛',
  Starters: '🥟',
  'Main Course': '🍽️',
  Desserts: '🍰',
  Beverages: '🥤',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as AdminTab | null;
  const { user, isAdmin } = useAuth();
  const { orders, updateOrderStatus, refreshOrders } = useOrders();
  const { showSuccess, showWarning, showError } = useToast();
  const {
    foodItems,
    toggleAvailability,
    saveFoodItem,
    deleteFoodItem,
    resetCatalog,
  } = useFood();

  const [activeTab, setActiveTab] = useState<AdminTab>(
    tabParam && ['overview', 'menu', 'orders', 'customers'].includes(tabParam)
      ? tabParam
      : 'overview'
  );

  useEffect(() => {
    if (tabParam && ['overview', 'menu', 'orders', 'customers'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('overview');
    }
  }, [tabParam]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
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
          Boolean(
            (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
            (o.deliveryAddress?.fullName && o.deliveryAddress.fullName.toLowerCase().includes(q)) ||
            (o.deliveryAddress?.phone && o.deliveryAddress.phone.includes(q)) ||
            ((o as any).customer?.fullName && (o as any).customer.fullName.toLowerCase().includes(q)) ||
            ((o as any).customer?.phone && (o as any).customer.phone.includes(q))
          )
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
    <div className="min-h-screen pt-20 sm:pt-24 pb-24 lg:pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Mobile Header (< lg: Clean Dedicated Mobile Console Header) */}
        <div className="lg:hidden mb-4 bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-100 text-orange-900 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>👑 Restaurant Admin</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {activeTab === 'overview' && 'Business Overview'}
                {activeTab === 'orders' && 'Order Management'}
                {activeTab === 'menu' && 'Menu Catalog'}
                {activeTab === 'customers' && 'Customer Directory'}
              </h1>
            </div>

            {/* Header Right Badges on Mobile */}
            {activeTab === 'menu' && (
              <span className="text-[11px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-xl shrink-0">
                {foodItems.length} Dishes
              </span>
            )}
            {activeTab === 'overview' && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shrink-0">
                Live Store
              </span>
            )}
            {activeTab === 'orders' && (
              <span className="text-[11px] font-bold text-primary-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-xl shrink-0">
                {orders.length} Orders
              </span>
            )}
            {activeTab === 'customers' && (
              <span className="text-[11px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-xl shrink-0">
                {customersList.length} Diners
              </span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-1">
            {activeTab === 'overview' && 'Real-time sales, order throughput, and menu performance'}
            {activeTab === 'orders' && 'Manage incoming customer orders and fulfillment statuses'}
            {activeTab === 'menu' && 'Update dish pricing, availability, and menu catalog'}
            {activeTab === 'customers' && 'View customer accounts, contact details, and order history'}
          </p>
        </div>

        {/* Dashboard Grid: Sidebar (col-span-3) + Main Content (col-span-9) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start">
          {/* Left Sidebar (Sticky on Laptop/PC) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20">
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3.5 flex flex-col gap-3.5">
              {/* Console Brand Header */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-xs">
                  <span className="text-sm">👑</span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-gray-900 tracking-tight">Admin Console</h2>
                  <p className="text-[10px] text-gray-500 font-medium">Foodie Haven Restaurant</p>
                </div>
              </div>

              {/* Navigation Stack */}
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Management
                </div>
                {[
                  { id: 'overview', label: 'Business Overview', icon: TrendingUp },
                  { id: 'orders', label: 'Live Orders', count: orders.length, icon: ShoppingBag },
                  { id: 'menu', label: 'Menu Catalog', count: foodItems.length, icon: Utensils },
                  { id: 'customers', label: 'Customers', count: customersList.length, icon: Users },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as AdminTab)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left group ${
                        active
                          ? 'bg-orange-50 text-orange-950 border border-orange-200 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${
                            active
                              ? 'bg-orange-100 text-orange-800'
                              : 'text-gray-500 bg-gray-100 group-hover:bg-gray-200/70'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{tab.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {tab.count !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              active
                                ? 'bg-orange-200 text-orange-900'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Kitchen & Restaurant Status Widget (Fills sidebar height gracefully) */}
              <div className="pt-3 border-t border-gray-100 space-y-2.5">
                <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Live Operations
                </div>
                
                <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Store Status</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/40">
                    <span className="text-gray-600 font-medium">In-Stock Catalog</span>
                    <span className="font-bold text-gray-900 text-xs">
                      {availableDishesCount} / {foodItems.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/40">
                    <span className="text-gray-600 font-medium">Active Kitchen Orders</span>
                    <span className="font-bold text-primary-600 text-xs">
                      {activeOrdersCount}
                    </span>
                  </div>
                </div>

                <Link
                  to="/"
                  target="_blank"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-gray-700 hover:text-primary-600 hover:bg-orange-50/60 rounded-xl border border-gray-200 bg-white transition-colors group"
                >
                  <span>Customer Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <div className="lg:col-span-9 w-full min-w-0 space-y-4 sm:space-y-5">
            {/* Contextual Header Strip (Laptop/PC) */}
            <div className="hidden lg:flex bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-md uppercase tracking-wide">
                    {activeTab === 'overview' && 'Live Metrics'}
                    {activeTab === 'orders' && 'Fulfillment'}
                    {activeTab === 'menu' && 'Inventory'}
                    {activeTab === 'customers' && 'Directory'}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {activeTab === 'overview' && 'Business Overview'}
                    {activeTab === 'orders' && 'Order Management'}
                    {activeTab === 'menu' && 'Menu Catalog'}
                    {activeTab === 'customers' && 'Customer Directory'}
                  </h1>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {activeTab === 'overview' && 'Real-time sales, order throughput, and menu performance metrics'}
                  {activeTab === 'orders' && 'Track incoming orders, customer details, and dispatch statuses'}
                  {activeTab === 'menu' && 'Manage dishes, pricing, availability toggles, and categories'}
                  {activeTab === 'customers' && 'Review registered diners, customer contacts, and spending history'}
                </p>
              </div>

              {/* Header Right Action/Info */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Real-time Sync</span>
                </div>
              </div>
            </div>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5 sm:space-y-6 animate-fade-in">
                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {/* Card 1: Total Revenue */}
                  <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-200/90 shadow-xs hover:border-orange-200 hover:shadow-sm transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block truncate">
                          Total Revenue
                        </span>
                        <div className="text-base sm:text-2xl font-black text-gray-900 mt-0.5 sm:mt-1 tracking-tight truncate">
                          {formatCurrency(totalRevenue)}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                        <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] sm:text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span className="truncate">+18.4%</span>
                    </div>
                  </div>

                  {/* Card 2: Total Orders */}
                  <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-200/90 shadow-xs hover:border-orange-200 hover:shadow-sm transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block truncate">
                          Total Orders
                        </span>
                        <div className="text-base sm:text-2xl font-black text-gray-900 mt-0.5 sm:mt-1 tracking-tight truncate">
                          {totalOrdersCount}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] sm:text-[11px] font-semibold text-primary-600 truncate">
                      {activeOrdersCount} in delivery
                    </div>
                  </div>

                  {/* Card 3: Today's Orders */}
                  <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-200/90 shadow-xs hover:border-orange-200 hover:shadow-sm transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block truncate">
                          Today's Orders
                        </span>
                        <div className="text-base sm:text-2xl font-black text-gray-900 mt-0.5 sm:mt-1 tracking-tight truncate">
                          {todayOrders.length}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] sm:text-[11px] text-gray-500 truncate">
                      Live customer orders
                    </div>
                  </div>

                  {/* Card 4: Available Dishes */}
                  <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-200/90 shadow-xs hover:border-orange-200 hover:shadow-sm transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 block truncate">
                          Available Dishes
                        </span>
                        <div className="text-base sm:text-2xl font-black text-gray-900 mt-0.5 sm:mt-1 tracking-tight truncate">
                          {availableDishesCount} / {foodItems.length}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 border border-purple-100">
                        <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] sm:text-[11px] font-semibold text-emerald-600 truncate">
                      {foodItems.length - availableDishesCount === 0
                        ? 'All in stock'
                        : `${foodItems.length - availableDishesCount} out of stock`}
                    </div>
                  </div>
                </div>

                {/* Sales Breakdown by Category & Order Statistics */}
                <div className="grid lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                  {/* Category Sales Distribution */}
                  <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-orange-100 text-orange-600">
                            <Layers className="w-4 h-4" />
                          </span>
                          <span>Menu Category Distribution</span>
                        </h3>
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          {foodItems.length} total dishes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {FOOD_CATEGORIES.filter((c) => c !== 'All').map((cat) => {
                          const count = foodItems.filter((f) => f.category === cat).length;
                          const percent = Math.round((count / foodItems.length) * 100) || 0;
                          const emoji = CATEGORY_EMOJIS[cat] || '🍽️';
                          return (
                            <div
                              key={cat}
                              className="p-2.5 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/20 transition-all bg-gray-50/40"
                            >
                              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                <span className="flex items-center gap-1.5 text-gray-800">
                                  <span className="text-sm">{emoji}</span>
                                  <span>{cat}</span>
                                </span>
                                <span className="text-gray-500 text-[11px] font-semibold">
                                  {count} <span className="text-gray-400 font-normal">({percent}%)</span>
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200/70 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>Categories represented: 8 active</span>
                      <button
                        onClick={() => setActiveTab('menu')}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
                      >
                        Manage menu items <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Recent Orders Quick Stream */}
                  <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-orange-100 text-orange-600">
                            <ShoppingBag className="w-4 h-4" />
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900">Recent Activity</h3>
                        </div>
                        <button
                          onClick={() => setActiveTab('orders')}
                          className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
                        >
                          View all <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        {orders.length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-xs">
                            No orders recorded yet.
                          </div>
                        ) : (
                          orders.slice(0, 3).map((order) => {
                            const isDelivered = order.status === 'Delivered';
                            const isCancelled = order.status === 'Cancelled';
                            return (
                              <div
                                key={order.id}
                                className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-orange-50/20 hover:border-orange-200 transition-all flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-[11px] text-gray-900 truncate">
                                      #{order.orderNumber}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-gray-700 truncate mt-0.5">
                                    {order.deliveryAddress?.fullName || (order as any).customer?.fullName || 'Valued Customer'}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {formatDateTime(order.createdAt)}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-extrabold text-xs text-gray-900 block">
                                    {formatCurrency(order.grandTotal)}
                                  </span>
                                  <span
                                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                      isDelivered
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : isCancelled
                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Bottom Live Fulfillment Mini-Widget */}
                    <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-gray-500 text-[11px]">Dispatch Stream</span>
                      </div>
                      <span className="font-bold text-gray-800 text-xs">
                        {orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length} active fulfillment
                      </span>
                    </div>
                  </div>
                </div>

          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4 sm:space-y-5 animate-fade-in">
            {/* Search & Status Filters */}
            <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200 flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-between items-stretch sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order #, customer, phone..."
                  className="input-field pl-9 py-2 text-xs sm:text-sm w-full"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="input-field py-2 text-xs sm:text-sm flex-1 sm:w-44"
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

            {/* Orders Table & Mobile Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              {/* Mobile Card View (< md) */}
              <div className="block md:hidden divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs sm:text-sm">
                    No matching orders found.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">
                            #{order.orderNumber}
                          </span>
                          <span className="block text-[10px] sm:text-[11px] text-gray-400">
                            {formatDateTime(order.createdAt)}
                          </span>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-bold rounded-lg px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${
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
                      </div>

                      <div className="text-xs text-gray-700 bg-gray-50 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-xs">
                            {order.deliveryAddress?.fullName || (order as any).customer?.fullName || 'Valued Customer'}
                          </span>
                          <span className="text-gray-500 font-mono text-[10px] sm:text-[11px]">
                            {order.deliveryAddress?.phone || (order as any).customer?.phone || ''}
                          </span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-gray-600 pt-1 border-t border-gray-200/60">
                          <span className="font-semibold text-gray-500">Items: </span>
                          {order.items.map((i) => `${i.foodItem.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="uppercase text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                            {order.paymentMethod}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold">
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="font-extrabold text-xs sm:text-sm text-gray-900">
                          {formatCurrency(order.grandTotal)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-gray-600 min-w-[700px]">
                  <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 sm:px-5">Order ID & Date</th>
                      <th className="py-3 px-4 sm:px-5">Customer</th>
                      <th className="py-3 px-4 sm:px-5">Items</th>
                      <th className="py-3 px-4 sm:px-5">Total Amount</th>
                      <th className="py-3 px-4 sm:px-5">Payment</th>
                      <th className="py-3 px-4 sm:px-5">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 sm:px-5">
                            <span className="font-mono font-bold text-gray-900 block text-xs">
                              #{order.orderNumber}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {formatDateTime(order.createdAt)}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="font-semibold text-gray-900 block text-xs">
                              {order.deliveryAddress?.fullName || (order as any).customer?.fullName || 'Valued Customer'}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {order.deliveryAddress?.phone || (order as any).customer?.phone || ''}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="text-xs font-medium text-gray-700">
                              {order.items.map((i) => `${i.foodItem.name} (x${i.quantity})`).join(', ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {formatCurrency(order.grandTotal)}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <span className="inline-block uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                              {order.paymentMethod}
                            </span>
                            <span className="block text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-0.5">
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 sm:px-5">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${
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
          <div className="space-y-4 sm:space-y-5 animate-fade-in">
            {/* Filter toolbar */}
            <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-gray-200 flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-between items-stretch sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search dish name or ingredient..."
                  className="input-field pl-9 py-2 text-xs sm:text-sm w-full"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={menuCategory}
                  onChange={(e) => setMenuCategory(e.target.value as FoodCategory)}
                  className="input-field py-2 text-xs sm:text-sm flex-1 sm:w-40"
                >
                  {FOOD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  onClick={resetCatalog}
                  className="btn-outline text-xs py-2 px-3 whitespace-nowrap flex items-center justify-center gap-1.5 border-gray-300 hover:border-primary-500 hover:text-primary-600 shrink-0"
                  title="Resync menu catalog names, pictures and descriptions with customer store"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sync Menu</span>
                </button>

                <button
                  onClick={openAddModal}
                  className="btn-primary text-xs py-2 px-3.5 whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Dish
                </button>
              </div>
            </div>

            {/* Menu Items Table & Mobile Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              {/* Mobile Card View (< md) */}
              <div className="block md:hidden divide-y divide-gray-100">
                {filteredMenu.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs sm:text-sm">
                    No dishes found in menu catalog.
                  </div>
                ) : (
                  filteredMenu.map((item) => (
                    <div key={item.id} className="p-3.5 space-y-2.5">
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                          }}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-100 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">{item.name}</h4>
                            <span
                              className={`shrink-0 inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.isVeg
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {item.isVeg ? 'Veg' : 'Non-Veg'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                              {formatCurrency(item.price)}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                        <button
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item.isAvailable ? '✓ In Stock' : '✕ Out of Stock'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFood(item.id)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-gray-600 min-w-[650px]">
                  <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 sm:px-5">Dish</th>
                      <th className="py-3 px-4 sm:px-5">Category</th>
                      <th className="py-3 px-4 sm:px-5">Type</th>
                      <th className="py-3 px-4 sm:px-5">Price</th>
                      <th className="py-3 px-4 sm:px-5">Stock Status</th>
                      <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMenu.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 sm:px-5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                              }}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                            />
                            <div>
                              <span className="font-bold text-gray-900 block text-xs sm:text-sm">{item.name}</span>
                              <span className="text-[11px] text-gray-400 line-clamp-1 max-w-xs">
                                {item.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 sm:px-5">
                          <span className="font-semibold text-gray-700 text-xs sm:text-sm">{item.category}</span>
                        </td>
                        <td className="py-3 px-4 sm:px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                              item.isVeg
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td className="py-3 px-4 sm:px-5 font-bold text-gray-900 text-xs sm:text-sm">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3 px-4 sm:px-5">
                          <button
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                              item.isAvailable
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.isAvailable ? '✓ In Stock' : '✕ Out of Stock'}
                          </button>
                        </td>
                        <td className="py-3 px-4 sm:px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFood(item.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
          <div className="space-y-4 sm:space-y-5 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-3.5 sm:p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Customer Directory</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Customers who have placed orders with Foodie Haven
                </p>
              </div>

              {/* Mobile Card View (< sm) */}
              <div className="block sm:hidden divide-y divide-gray-100">
                {customersList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs sm:text-sm">
                    No customers found.
                  </div>
                ) : (
                  customersList.map((cust, idx) => (
                    <div key={idx} className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">{cust.name}</span>
                        <span className="font-bold text-emerald-600 text-xs">
                          {formatCurrency(cust.totalSpent)}
                        </span>
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-500 space-y-0.5">
                        <div className="truncate">{cust.email}</div>
                        <div>{cust.phone}</div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100 text-gray-500">
                        <span>Total Orders:</span>
                        <span className="font-bold text-gray-900">{cust.ordersCount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-gray-600 min-w-[600px]">
                  <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-400 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 sm:px-5">Customer Name</th>
                      <th className="py-3 px-4 sm:px-5">Contact Email</th>
                      <th className="py-3 px-4 sm:px-5">Phone Number</th>
                      <th className="py-3 px-4 sm:px-5">Total Orders</th>
                      <th className="py-3 px-4 sm:px-5">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customersList.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 sm:px-5 font-bold text-gray-900 text-xs sm:text-sm">{cust.name}</td>
                        <td className="py-3 px-4 sm:px-5 text-gray-700 text-xs">{cust.email}</td>
                        <td className="py-3 px-4 sm:px-5 text-gray-700 text-xs">{cust.phone}</td>
                        <td className="py-3 px-4 sm:px-5 font-semibold text-gray-900 text-xs sm:text-sm">
                          {cust.ordersCount}
                        </td>
                        <td className="py-3 px-4 sm:px-5 font-bold text-emerald-600 text-xs sm:text-sm">
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
    </div>
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
