import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../lib/utils';
import { DeliveryAddress, DeliveryType, PaymentMethod } from '../types';
import { MapPin, Clock, CreditCard, Truck, Store, Loader2, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart, subtotal, deliveryFee, tax, discount, grandTotal, appliedCoupon, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { showSuccess, showError, showWarning } = useToast();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    houseNumber: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    instructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!isAuthenticated) {
      showWarning('Please login to proceed with checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }

    if (cart.length === 0) {
      showWarning('Your cart is empty');
      navigate('/menu');
    }
  }, [isAuthenticated, cart, navigate, showWarning]);

  const validateAddress = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!address.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!address.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!address.email.trim()) newErrors.email = 'Email address is required';

    if (deliveryType !== 'pickup') {
      if (!address.houseNumber.trim()) newErrors.houseNumber = 'House/Flat number is required';
      if (!address.street.trim()) newErrors.street = 'Street address is required';
      if (!address.city.trim()) newErrors.city = 'City is required';
      if (!address.state.trim()) newErrors.state = 'State is required';
      if (!address.pincode.trim()) newErrors.pincode = 'Pincode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatedDeliveryFee = deliveryType === 'pickup' ? 0 : deliveryType === 'express' ? 79 : deliveryFee;
  const finalTotal = subtotal + calculatedDeliveryFee + tax - discount;

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      showError(
        deliveryType === 'pickup'
          ? 'Please fill in your contact information (Name, Phone & Email)'
          : 'Please fill in all required delivery details'
      );
      return;
    }

    setLoading(true);

    try {
      const orderAddress: DeliveryAddress = deliveryType === 'pickup'
        ? {
            ...address,
            houseNumber: 'Pickup Order',
            street: 'Store Pickup at Foodie Haven (123 MG Road)',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
          }
        : address;

      const order = await createOrder({
        items: cart,
        subtotal,
        deliveryFee: calculatedDeliveryFee,
        tax,
        discount,
        couponApplied: appliedCoupon || undefined,
        grandTotal: finalTotal,
        deliveryAddress: orderAddress,
        deliveryType,
        paymentMethod,
      });

      clearCart();
      showSuccess('Order placed successfully! 🎉');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      showError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Type */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-600" />
                Delivery Option
              </h2>

              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryType('standard');
                    setErrors({});
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    deliveryType === 'standard'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck className={`w-6 h-6 mx-auto mb-2 ${deliveryType === 'standard' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div className="font-semibold text-sm text-gray-900">Standard</div>
                  <div className="text-xs text-gray-500">30-45 mins</div>
                  <div className="text-xs font-bold text-primary-600 mt-1">
                    {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(deliveryFee)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryType('express');
                    setErrors({});
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    deliveryType === 'express'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Clock className={`w-6 h-6 mx-auto mb-2 ${deliveryType === 'express' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div className="font-semibold text-sm text-gray-900">Express</div>
                  <div className="text-xs text-gray-500">15-25 mins</div>
                  <div className="text-xs font-bold text-primary-600 mt-1">{formatCurrency(79)}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeliveryType('pickup');
                    setErrors({});
                  }}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    deliveryType === 'pickup'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store className={`w-6 h-6 mx-auto mb-2 ${deliveryType === 'pickup' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <div className="font-semibold text-sm text-gray-900">Pickup</div>
                  <div className="text-xs text-gray-500">10-15 mins</div>
                  <div className="text-xs font-bold text-emerald-600 mt-1">FREE</div>
                </button>
              </div>
            </div>

            {/* Delivery Address / Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  {deliveryType === 'pickup' ? 'Contact Information (Self Pickup)' : 'Delivery Address'}
                </h2>
                {deliveryType === 'pickup' && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                    No address needed for pickup
                  </span>
                )}
              </div>

              {deliveryType === 'pickup' && (
                <div className="mb-6 p-4 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-gray-700 flex items-start gap-3">
                  <Store className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block text-sm">Pickup Location:</span>
                    Foodie Haven, 123 MG Road, Bangalore, Karnataka 560001
                    <span className="block text-gray-500 mt-1">Your order will be freshly packed and ready at the counter in 10-15 mins.</span>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
                    placeholder="Rahul Sharma"
                  />
                  {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="rahul.sharma@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {deliveryType !== 'pickup' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        House / Flat / Building No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.houseNumber}
                        onChange={(e) => setAddress({ ...address, houseNumber: e.target.value })}
                        className={`input-field ${errors.houseNumber ? 'border-red-500' : ''}`}
                        placeholder="Flat 402, Sunshine Apartments"
                      />
                      {errors.houseNumber && <p className="text-xs text-red-600 mt-1">{errors.houseNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address / Area <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className={`input-field ${errors.street ? 'border-red-500' : ''}`}
                        placeholder="12th Main, Indiranagar"
                      />
                      {errors.street && <p className="text-xs text-red-600 mt-1">{errors.street}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                        placeholder="Bangalore"
                      />
                      {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className={`input-field ${errors.state ? 'border-red-500' : ''}`}
                        placeholder="Karnataka"
                      />
                      {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        PIN Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        className={`input-field ${errors.pincode ? 'border-red-500' : ''}`}
                        placeholder="560038"
                      />
                      {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Instructions (Optional)
                      </label>
                      <textarea
                        value={address.instructions}
                        onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                        className="input-field resize-none"
                        rows={2}
                        placeholder="E.g., Ring bell twice, leave with security..."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {[
                  { id: 'cod', label: 'Cash on Delivery / Pay on Pickup', icon: '💵' },
                  { id: 'upi', label: 'UPI / QR Code (GPay, PhonePe, Paytm)', icon: '📱' },
                  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                  { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-semibold text-gray-900">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                      }}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{item.foodItem.name}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-gray-900">{formatCurrency(item.totalPrice)}</div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 py-4 border-t border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>
                    {calculatedDeliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatCurrency(calculatedDeliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST & Restaurant Tax (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between text-lg font-black text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-primary-600">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Place Order · {formatCurrency(finalTotal)}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-3">
                🔒 100% Secure & Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
