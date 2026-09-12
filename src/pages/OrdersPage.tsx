import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, ArrowRight, RotateCcw, XCircle, Eye, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { Order, OrderStatus } from '../types';
import OrderTracker from '../components/OrderTracker';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { getUserOrders, cancelOrder } = useOrders();
  const { addToCart, openCartDrawer } = useCart();
  const { showSuccess, showError, showWarning } = useToast();

  const orders = getUserOrders();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return ['Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery'].includes(order.status);
    }
    if (filter === 'completed') {
      return order.status === 'Delivered';
    }
    if (filter === 'cancelled') {
      return order.status === 'Cancelled';
    }
    return true;
  });

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        foodItem: item.foodItem,
        quantity: item.quantity,
        customizations: item.selectedCustomizations,
        addOns: item.selectedAddOns,
        specialInstructions: item.specialInstructions,
      });
    });
    showSuccess(`Added ${order.items.length} items to your cart!`);
    openCartDrawer();
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const success = cancelOrder(orderId);
      if (success) {
        showWarning('Order has been cancelled.');
      } else {
        showError('Order cannot be cancelled at this stage.');
      }
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Confirmed':
      case 'Order Placed':
      default:
        return 'bg-primary-100 text-primary-800 border-primary-300';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Track current orders and view past receipts</p>
          </div>
          <Link to="/menu" className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto text-sm">
            <span>Order New Food</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'Active & In-Progress' },
            { id: 'completed', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List / Empty */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm max-w-md mx-auto my-8">
            <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 text-sm mb-6">
              You haven't placed any orders matching this filter yet.
            </p>
            <Link to="/menu" className="btn-primary">
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const canCancel = order.status === 'Order Placed' || order.status === 'Confirmed';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Order Card Header */}
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base sm:text-lg text-gray-900">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(order.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{order.items.length} items</span>
                        <span>•</span>
                        <span className="font-bold text-gray-900">{formatCurrency(order.grandTotal)}</span>
                      </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="btn-outline text-xs py-2 px-3 flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleReorder(order)}
                        className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="p-6">
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <img
                            src={item.foodItem.image}
                            alt={item.foodItem.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                            }}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 text-xs truncate">
                              {item.foodItem.name}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Tracker & Bill Details */}
                  {isExpanded && (
                    <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-6 animate-fade-in">
                      {/* Live Stepper Tracker */}
                      <div>
                        <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">
                          Live Tracking
                        </h4>
                        <div className="bg-white p-4 rounded-2xl border border-gray-200">
                          <OrderTracker order={order} />
                        </div>
                      </div>

                      {/* Address & Payment Info */}
                      <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-white p-4 rounded-2xl border border-gray-200">
                          <h5 className="font-bold text-gray-900 mb-2">
                            {order.deliveryType === 'pickup' ? 'Pickup Information' : 'Delivery Address'}
                          </h5>
                          {order.deliveryType === 'pickup' ? (
                            <>
                              <p className="text-gray-700 font-semibold">{order.deliveryAddress.fullName}</p>
                              <p className="text-gray-600">{order.deliveryAddress.phone}</p>
                              <p className="text-primary-600 font-semibold mt-1">
                                Store Pickup · 123 MG Road, Bangalore
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-700 font-semibold">{order.deliveryAddress.fullName}</p>
                              <p className="text-gray-600">{order.deliveryAddress.phone}</p>
                              <p className="text-gray-600">
                                {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}
                              </p>
                              <p className="text-gray-600">
                                {order.deliveryAddress.city}, {order.deliveryAddress.state} -{' '}
                                {order.deliveryAddress.pincode}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-gray-200">
                          <h5 className="font-bold text-gray-900 mb-2">Payment Details</h5>
                          <div className="space-y-1 text-gray-600">
                            <div className="flex justify-between">
                              <span>Method:</span>
                              <span className="font-bold uppercase text-gray-800">
                                {order.paymentMethod}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payment Status:</span>
                              <span className="font-semibold text-emerald-600">{order.paymentStatus}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-gray-900">
                              <span>Total Paid:</span>
                              <span>{formatCurrency(order.grandTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2">
                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel this order
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/order-confirmation/${order.id}`)}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-700 ml-auto flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Full Receipt Page
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
