import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus, CartItem, DeliveryAddress, DeliveryType, PaymentMethod, Coupon } from '../types';
import { generateId, generateOrderNumber } from '../lib/utils';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { orderApi } from '../lib/api';
import { MOCK_FOOD_ITEMS } from '../data/mockData';

interface CreateOrderData {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  couponApplied?: Coupon;
  grandTotal: number;
  deliveryAddress: DeliveryAddress;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (data: CreateOrderData) => Promise<Order>;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (userId?: string) => Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => boolean;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDER_CHANNEL_NAME = 'foodie_orders_sync_channel';

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('foodie_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { user, isAdmin } = useAuth();
  const { showSuccess, showInfo } = useToast();
  const orderChannelRef = React.useRef<BroadcastChannel | null>(null);

  // Fetch real orders directly from MongoDB Atlas on mount and refresh
  const refreshOrders = async () => {
    try {
      const dbOrders = await orderApi.getAllOrders();
      if (Array.isArray(dbOrders)) {
        const formatted: Order[] = dbOrders.map((o: any) => ({
          ...o,
          id: o._id || o.id || o.orderNumber,
        }));
        setOrders(formatted);
        localStorage.setItem('foodie_orders', JSON.stringify(formatted));
      }
    } catch (e) {
      // Backend offline or local fallback
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [user?.email, isAdmin]);

  // Cross-tab and real-time live synchronization listeners
  useEffect(() => {
    // 1. Persistent BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const ch = new BroadcastChannel(ORDER_CHANNEL_NAME);
        orderChannelRef.current = ch;
        ch.onmessage = (event) => {
          if (event.data && event.data.type === 'ORDERS_SYNC' && Array.isArray(event.data.orders)) {
            setOrders(event.data.orders);
            const meta = event.data.meta;
            if (meta?.newStatus && !isAdmin) {
              showInfo(`🔔 Order #${meta.orderNumber || meta.orderId || ''} status updated: ${meta.newStatus}`);
            }
          }
        };
      } catch (e) {}
    }

    // 2. Storage event listener (fires across tabs when localStorage is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'foodie_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Custom intra-tab event listener
    const handleCustomOrders = (e: Event) => {
      const customEvent = e as CustomEvent<Order[]>;
      if (Array.isArray(customEvent.detail)) {
        setOrders(customEvent.detail);
      }
    };
    window.addEventListener('foodie_orders_custom_sync', handleCustomOrders);

    // 4. Ultra-fast 400ms polling heartbeat
    const syncInterval = setInterval(() => {
      try {
        const saved = localStorage.getItem('foodie_orders');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setOrders((prev) => {
              if (JSON.stringify(prev) !== saved) {
                return parsed;
              }
              return prev;
            });
          }
        }
      } catch (err) {}
    }, 400);

    return () => {
      if (orderChannelRef.current) {
        try {
          orderChannelRef.current.close();
        } catch (e) {}
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('foodie_orders_custom_sync', handleCustomOrders);
      clearInterval(syncInterval);
    };
  }, [isAdmin, showInfo]);

  // Helper to persist and broadcast orders
  const syncAndBroadcastOrders = (
    updatedOrders: Order[],
    meta?: { orderId?: string; orderNumber?: string; newStatus?: OrderStatus; action?: string }
  ) => {
    // 1. Update React state locally immediately
    setOrders(updatedOrders);

    // 2. Persist to localStorage immediately
    try {
      localStorage.setItem('foodie_orders', JSON.stringify(updatedOrders));
    } catch (e) {}

    // 3. Dispatch local custom event
    try {
      window.dispatchEvent(new CustomEvent('foodie_orders_custom_sync', { detail: updatedOrders }));
    } catch (e) {}

    // 4. Broadcast across tabs via persistent BroadcastChannel
    if (orderChannelRef.current) {
      try {
        orderChannelRef.current.postMessage({
          type: 'ORDERS_SYNC',
          orders: updatedOrders,
          meta,
        });
      } catch (e) {}
    }
  };

  const createOrder = async (data: CreateOrderData): Promise<Order> => {
    const now = new Date().toISOString();
    const generatedNum = generateOrderNumber();

    const orderPayload = {
      orderNumber: generatedNum,
      userId: user?.id,
      customer: {
        fullName: data.deliveryAddress?.fullName || user?.fullName || 'Valued Customer',
        email: data.deliveryAddress?.email || user?.email || 'customer@example.com',
        phone: data.deliveryAddress?.phone || user?.phone || '+91 98765 00000',
      },
      items: data.items,
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      tax: data.tax,
      discount: data.discount,
      couponApplied: data.couponApplied,
      grandTotal: data.grandTotal,
      deliveryAddress: data.deliveryAddress,
      deliveryType: data.deliveryType,
      paymentMethod: data.paymentMethod,
      paymentStatus: (data.paymentMethod === 'cod' ? 'Pending' : 'Paid') as 'Paid' | 'Pending' | 'Failed',
      estimatedDeliveryTime:
        data.deliveryType === 'express'
          ? '15-25 mins'
          : data.deliveryType === 'pickup'
          ? '10-15 mins'
          : '30-45 mins',
      status: 'Order Placed' as OrderStatus,
      statusTimestamps: {
        placed: now,
      },
    };

    let createdOrder: Order = {
      id: `ord-${generateId()}`,
      ...orderPayload,
      userId: user?.id || 'customer',
      createdAt: now,
    };

    // Persist to MongoDB backend in Atlas
    try {
      const dbResult = await orderApi.create(orderPayload);
      if (dbResult) {
        createdOrder = {
          ...createdOrder,
          ...dbResult,
          id: (dbResult as any)._id || dbResult.id || createdOrder.id,
        };
      }
    } catch (e) {
      console.warn('MongoDB order sync fallback to local store:', e);
    }

    const updated = [createdOrder, ...orders.filter((o) => o.orderNumber !== createdOrder.orderNumber)];
    syncAndBroadcastOrders(updated, {
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      action: 'create',
    });
    setCurrentOrder(createdOrder);
    showSuccess(`Order placed successfully! #${createdOrder.orderNumber}`);

    return createdOrder;
  };

  const getOrderById = (orderId: string) => {
    if (!orderId) return undefined;
    const cleanId = String(orderId).trim().toLowerCase();
    return orders.find((o) => {
      const oid = String(o.id || '').trim().toLowerCase();
      const oNum = String(o.orderNumber || '').trim().toLowerCase();
      const mongoId = String((o as any)._id || '').trim().toLowerCase();
      return oid === cleanId || oNum === cleanId || mongoId === cleanId;
    });
  };

  const getUserOrders = (userId?: string) => {
    const targetUserId = userId || user?.id;
    const userEmail = (user?.email || '').trim().toLowerCase();

    // If neither targetUserId nor email available, only return current session order or empty
    if (!targetUserId && !userEmail) {
      return currentOrder ? [currentOrder] : [];
    }

    return orders.filter((o) => {
      const orderUserId = String(o.userId || '').trim();
      const custEmail = String((o as any).customer?.email || '').trim().toLowerCase();
      const delEmail = String(o.deliveryAddress?.email || '').trim().toLowerCase();

      return (
        (targetUserId && orderUserId === targetUserId) ||
        (userEmail && custEmail === userEmail) ||
        (userEmail && delEmail === userEmail)
      );
    });
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const now = new Date().toISOString();
    let targetOrderNumber = '';

    const updatedOrders = orders.map((order) => {
      if (order.id === orderId || order.orderNumber === orderId || (order as any)._id === orderId) {
        targetOrderNumber = order.orderNumber;
        const timestamps = { ...order.statusTimestamps };
        if (status === 'Confirmed') timestamps.confirmed = now;
        if (status === 'Preparing') timestamps.preparing = now;
        if (status === 'Out for Delivery') timestamps.outForDelivery = now;
        if (status === 'Delivered') {
          timestamps.delivered = now;
          order.paymentStatus = 'Paid';
        }
        if (status === 'Cancelled') timestamps.cancelled = now;

        return {
          ...order,
          status,
          statusTimestamps: timestamps,
        };
      }
      return order;
    });

    syncAndBroadcastOrders(updatedOrders, {
      orderId,
      orderNumber: targetOrderNumber,
      newStatus: status,
      action: 'update_status',
    });

    // Persist to MongoDB backend if connected
    try {
      await orderApi.updateStatus(orderId, status);
    } catch (e) {}

    showInfo(`Order status updated to "${status}"`);
  };

  const cancelOrder = (orderId: string): boolean => {
    const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return false;

    if (order.status === 'Delivered' || order.status === 'Out for Delivery') {
      return false;
    }

    updateOrderStatus(orderId, 'Cancelled');
    try {
      orderApi.cancel(orderId);
    } catch (e) {}
    return true;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        createOrder,
        getOrderById,
        getUserOrders,
        updateOrderStatus,
        cancelOrder,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
