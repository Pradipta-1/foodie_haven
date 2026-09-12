import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, CreditCard, ArrowRight, Package, ShoppingBag, Printer, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOrders } from '../context/OrderContext';
import { formatCurrency, formatDateTime } from '../lib/utils';
import OrderTracker from '../components/OrderTracker';
import { orderApi } from '../lib/api';
import { Order } from '../types';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, refreshOrders } = useOrders();
  const [localOrder, setLocalOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const contextOrder = orderId ? getOrderById(orderId) : null;
  const order = contextOrder || localOrder;

  useEffect(() => {
    // Fire confetti when confirmation page loads
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#eb6f1a', '#dc5410', '#10b981', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchOrder = async () => {
      if (contextOrder) {
        setLoading(false);
        return;
      }
      if (orderId) {
        try {
          const dbOrder = await orderApi.getById(orderId);
          if (dbOrder && mounted) {
            setLocalOrder({
              ...dbOrder,
              id: (dbOrder as any)._id || dbOrder.id || dbOrder.orderNumber,
            });
          }
        } catch (e) {
          try {
            await refreshOrders();
          } catch (rErr) {}
        }
      }
      if (mounted) setLoading(false);
    };

    fetchOrder();
    return () => {
      mounted = false;
    };
  }, [orderId, contextOrder]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16 text-center px-4 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
        <p className="text-gray-500 font-semibold">Loading your order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 pb-16 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We could not locate this order details.</p>
        <Link to="/orders" className="btn-primary">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm text-center mb-8 animate-slide-up">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Order Successful
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Thank you for your order!
          </h1>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
            Your order has been received and is being prepared with love and fresh ingredients.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Order Number</span>
              <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-gray-500 block text-xs">Estimated Delivery</span>
              <span className="font-bold text-primary-600 flex items-center gap-1 justify-center">
                <Clock className="w-4 h-4" /> {order.estimatedDeliveryTime}
              </span>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-gray-500 block text-xs">Order Date</span>
              <span className="font-semibold text-gray-900">{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Live Order Tracker */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-600" />
            Order Progress
          </h2>
          <OrderTracker order={order} />
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Items Summary */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              Order Items ({order.items.length})
            </h3>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-2">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                      }}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.foodItem.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-black text-gray-900 text-base">
                <span>Total Amount</span>
                <span className="text-primary-600">{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                {order.deliveryType === 'pickup' ? 'Pickup Information' : 'Delivery Information'}
              </h3>
              {order.deliveryType === 'pickup' ? (
                <div className="text-sm text-gray-600 space-y-2">
                  <div>
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Customer Contact</span>
                    <p className="font-bold text-gray-900">{order.deliveryAddress.fullName}</p>
                    <p>{order.deliveryAddress.phone}</p>
                    {order.deliveryAddress.email && <p>{order.deliveryAddress.email}</p>}
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 block font-semibold uppercase">Pickup Counter</span>
                    <p className="font-semibold text-gray-900">Foodie Haven Restaurant</p>
                    <p>123 MG Road, Bangalore, Karnataka 560001</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-bold text-gray-900">{order.deliveryAddress.fullName}</p>
                  <p>{order.deliveryAddress.phone}</p>
                  <p>{order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-xs text-gray-400 italic mt-2">
                      Note: "{order.deliveryAddress.instructions}"
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                Payment Summary
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-semibold text-gray-900 uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6"
          >
            <Package className="w-4 h-4" />
            View All Orders
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
