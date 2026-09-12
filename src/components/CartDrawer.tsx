import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    itemCount,
    subtotal,
  } = useCart();

  React.useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/cart');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={closeCartDrawer}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-accent-50">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <p className="text-sm text-gray-600">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCartDrawer}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Start adding delicious items to your cart!</p>
              <button
                onClick={() => {
                  closeCartDrawer();
                  navigate('/menu');
                }}
                className="btn-primary"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3">
                  {/* Image */}
                  <img
                    src={item.foodItem.image}
                    alt={item.foodItem.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                    }}
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Item Info */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {item.foodItem.name}
                        </h3>
                        <p className="text-xs text-gray-500">{item.foodItem.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customizations */}
                    {(item.selectedCustomizations.length > 0 || item.selectedAddOns.length > 0) && (
                      <div className="text-xs text-gray-600 mb-2 space-y-0.5">
                        {item.selectedCustomizations.map((custom, idx) => (
                          <div key={idx}>• {custom.optionName}</div>
                        ))}
                        {item.selectedAddOns.map((addon, idx) => (
                          <div key={idx}>• Add: {addon.name}</div>
                        ))}
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <p className="text-xs text-gray-500 italic mb-2 line-clamp-1">
                        Note: {item.specialInstructions}
                      </p>
                    )}

                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">
                        {formatCurrency(item.totalPrice)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 bg-white hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-md flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-md flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700">Subtotal</span>
              <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn-primary w-full text-base flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-center text-gray-500">
              Delivery fee and taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
