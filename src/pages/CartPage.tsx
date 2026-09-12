import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, Tag, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { MOCK_COUPONS } from '../data/mockData';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    tax,
    discount,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const handleQuickCouponClick = (code: string) => {
    applyCoupon(code);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center bg-white rounded-3xl shadow-sm border border-gray-200">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our delicious menu and find something you crave!
          </p>
          <Link to="/menu" className="btn-primary inline-flex items-center justify-center gap-2 w-full py-3.5">
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">Your Shopping Cart</h1>
            <p className="text-gray-500 text-sm mt-1">Review your order and apply discount coupons</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg border border-red-200 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:shadow-md"
              >
                {/* Image */}
                <img
                  src={item.foodItem.image}
                  alt={item.foodItem.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full border ${
                        item.foodItem.isVeg
                          ? 'border-green-600 bg-green-500'
                          : 'border-red-600 bg-red-500'
                      }`}
                    />
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                      {item.foodItem.name}
                    </h3>
                  </div>

                  {/* Customizations & Add-ons */}
                  {(item.selectedCustomizations.length > 0 || item.selectedAddOns.length > 0) && (
                    <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                      {item.selectedCustomizations.map((c, i) => (
                        <span key={i} className="inline-block mr-2 bg-gray-100 px-2 py-0.5 rounded">
                          {c.optionName} {c.price > 0 && `(+${formatCurrency(c.price)})`}
                        </span>
                      ))}
                      {item.selectedAddOns.map((a, i) => (
                        <span key={i} className="inline-block mr-2 bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
                          +{a.name} ({formatCurrency(a.price)})
                        </span>
                      ))}
                    </div>
                  )}

                  {item.specialInstructions && (
                    <p className="text-xs text-gray-400 italic mt-1">
                      Note: {item.specialInstructions}
                    </p>
                  )}

                  <div className="mt-2 text-sm font-semibold text-gray-700">
                    Unit Price: {formatCurrency(item.unitPrice)}
                  </div>
                </div>

                {/* Quantity & Total Price */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-white hover:bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center font-bold transition-colors shadow-xs"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center font-bold transition-colors shadow-xs"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-gray-900">
                      {formatCurrency(item.totalPrice)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 flex items-center justify-between">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Add More Items
              </Link>
            </div>
          </div>

          {/* Order Summary & Coupons */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-600" />
                Coupons & Discounts
              </h3>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
                      <Check className="w-4 h-4" />
                      {appliedCoupon.code} Applied!
                    </div>
                    <p className="text-xs text-emerald-600">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-800 underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
                    Apply
                  </button>
                </form>
              )}

              {/* Quick Available Coupons list */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Available Offers
                </span>
                <div className="space-y-2">
                  {MOCK_COUPONS.map((cpn) => (
                    <div
                      key={cpn.code}
                      onClick={() => handleQuickCouponClick(cpn.code)}
                      className="p-2.5 rounded-xl border border-dashed border-gray-300 hover:border-primary-500 bg-gray-50/50 hover:bg-primary-50/30 cursor-pointer transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-primary-700 bg-primary-100 px-2 py-0.5 rounded">
                          {cpn.code}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500">
                          Min. {formatCurrency(cpn.minOrderAmount)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{cpn.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-xs">Free</span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-black text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-[11px] text-center text-gray-400">
                🔒 Safe & Secure 256-bit Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
