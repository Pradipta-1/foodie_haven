import React from 'react';
import { Plus, Minus, Clock, Flame } from 'lucide-react';
import { FoodItem } from '../types';
import { formatCurrency } from '../lib/utils';
import RatingStars from './RatingStars';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  item: FoodItem;
  onSelect: (item: FoodItem) => void;
  onQuickAdd?: (item: FoodItem) => void;
}

export default function FoodCard({ item, onSelect, onQuickAdd }: FoodCardProps) {
  const { cart, updateQuantity, addToCart } = useCart();

  // Find if item without complex customizations is in cart
  const cartItem = cart.find((ci) => ci.foodItem.id === item.id && ci.selectedCustomizations.length === 0);
  const quantity = cartItem?.quantity || 0;

  const hasCustomizations = (item.customizations && item.customizations.length > 0) || (item.addOns && item.addOns.length > 0);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isAvailable) return;

    if (hasCustomizations) {
      onSelect(item);
    } else {
      if (onQuickAdd) {
        onQuickAdd(item);
      } else {
        addToCart({ foodItem: item, quantity: 1 });
      }
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.id, quantity + 1);
    } else {
      handleAddClick(e);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.id, quantity - 1);
    }
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image Container: Uniform fixed aspect/height so all food photos are identical in size */}
      <div className="relative w-full h-48 sm:h-44 md:h-48 overflow-hidden bg-gray-100 shrink-0">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
          }}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 block"
        />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm p-1 sm:p-1.5 rounded-lg shadow-md flex items-center gap-1">
          <span
            className={`w-2.5 h-2.5 rounded-full border-2 ${
              item.isVeg
                ? 'border-green-600 bg-green-500'
                : 'border-red-600 bg-red-500'
            }`}
          />
          <span className="text-[10px] sm:text-[11px] font-semibold text-gray-700">
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Badges: Popular / Chef Special */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
          {item.isChefSpecial && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              ★ Chef's Special
            </span>
          )}
          {item.isPopular && !item.isChefSpecial && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
              <Flame className="w-3 h-3" /> Popular
            </span>
          )}
        </div>

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Category */}
          <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs text-gray-400 mb-0.5">
            <span className="font-medium text-primary-600 uppercase tracking-wider">
              {item.category}
            </span>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{item.prepTimeMinutes} mins</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-primary-600 transition-colors line-clamp-1">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Rating & Bottom Actions */}
        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-gray-900">
                {formatCurrency(item.price)}
              </span>
              {item.originalPrice && (
                <span className="text-[11px] text-gray-400 line-through">
                  {formatCurrency(item.originalPrice)}
                </span>
              )}
            </div>
            <RatingStars rating={item.rating} size="sm" count={item.ratingCount} />
          </div>

          {/* Add to Cart / Quantity controller */}
          <div>
            {!item.isAvailable ? (
              <button
                disabled
                className="px-2.5 py-1 bg-gray-200 text-gray-400 text-xs font-medium rounded-lg cursor-not-allowed"
              >
                Sold Out
              </button>
            ) : quantity > 0 && !hasCustomizations ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 bg-primary-50 border border-primary-200 rounded-lg p-0.5 shadow-xs"
              >
                <button
                  onClick={handleDecrement}
                  className="w-6 h-6 bg-white hover:bg-primary-600 hover:text-white text-primary-700 rounded-md flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-4 text-center font-bold text-xs text-primary-900">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="w-6 h-6 bg-primary-600 hover:bg-primary-700 text-white rounded-md flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="flex items-center gap-1 bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white border border-primary-200 hover:border-transparent px-2.5 py-1.5 rounded-lg font-semibold text-xs transition-all duration-200 shadow-xs hover:scale-105 active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{hasCustomizations ? 'Customize' : 'Add'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
