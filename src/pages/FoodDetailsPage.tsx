import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, Minus, Check, Star, ShieldCheck, Truck } from 'lucide-react';
import { SelectedCustomization, CartItemAddOn, CustomizationGroup } from '../types';
import { formatCurrency } from '../lib/utils';
import RatingStars from '../components/RatingStars';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useFood } from '../context/FoodContext';

export default function FoodDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showWarning } = useToast();
  const { getFoodById } = useFood();

  const foodItem = id ? getFoodById(id) : undefined;

  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<CartItemAddOn[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!foodItem) {
    return (
      <div className="min-h-screen pt-32 pb-16 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dish Not Found</h2>
        <p className="text-gray-500 mb-6">The item you are looking for does not exist or has been removed.</p>
        <Link to="/menu" className="btn-primary">
          Back to Menu
        </Link>
      </div>
    );
  }

  const handleCustomizationChange = (group: CustomizationGroup, optionId: string) => {
    if (group.type === 'single') {
      setSelectedCustomizations((prev) => {
        const filtered = prev.filter((c) => c.groupId !== group.id);
        const option = group.options.find((o) => o.id === optionId);
        if (option) {
          return [
            ...filtered,
            {
              groupId: group.id,
              groupTitle: group.title,
              optionId: option.id,
              optionName: option.name,
              price: option.price,
            },
          ];
        }
        return filtered;
      });
    } else {
      setSelectedCustomizations((prev) => {
        const exists = prev.find((c) => c.groupId === group.id && c.optionId === optionId);
        if (exists) {
          return prev.filter((c) => !(c.groupId === group.id && c.optionId === optionId));
        } else {
          const option = group.options.find((o) => o.id === optionId);
          if (option) {
            return [
              ...prev,
              {
                groupId: group.id,
                groupTitle: group.title,
                optionId: option.id,
                optionName: option.name,
                price: option.price,
              },
            ];
          }
          return prev;
        }
      });
    }
  };

  const handleAddOnToggle = (addOn: CartItemAddOn) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.id === addOn.id);
      if (exists) {
        return prev.filter((a) => a.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const calculateTotal = () => {
    let total = foodItem.price;
    selectedCustomizations.forEach((c) => {
      total += c.price;
    });
    selectedAddOns.forEach((a) => {
      total += a.price;
    });
    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!foodItem.isAvailable) {
      showWarning('This dish is currently out of stock.');
      return;
    }

    if (foodItem.customizations) {
      for (const group of foodItem.customizations) {
        if (group.required) {
          const hasSelection = selectedCustomizations.some((c) => c.groupId === group.id);
          if (!hasSelection) {
            showWarning(`Please select an option for ${group.title}`);
            return;
          }
        }
      }
    }

    addToCart({
      foodItem,
      quantity,
      customizations: selectedCustomizations,
      addOns: selectedAddOns,
      specialInstructions,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden grid lg:grid-cols-12 gap-0">
          {/* Left Column: Image */}
          <div className="lg:col-span-6 relative bg-gray-100 min-h-[350px] lg:min-h-[600px]">
            <img
              src={foodItem.image}
              alt={foodItem.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full border-2 ${
                  foodItem.isVeg ? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'
                }`}
              />
              <span className="text-xs font-bold text-gray-800">
                {foodItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              </span>
            </div>
          </div>

          {/* Right Column: Details & Customizations */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Category & Prep Time */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-md">
                  {foodItem.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>{foodItem.prepTimeMinutes} mins prep time</span>
                </div>
              </div>

              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">{foodItem.name}</h1>
                <div className="mt-2 flex items-center gap-4">
                  <RatingStars rating={foodItem.rating} size="md" count={foodItem.ratingCount} />
                  {foodItem.calories && (
                    <span className="text-sm font-medium text-gray-500">
                      • {foodItem.calories} kcal
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">
                  {formatCurrency(foodItem.price)}
                </span>
                {foodItem.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(foodItem.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {foodItem.description}
              </p>

              {/* Ingredients */}
              {foodItem.ingredients && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                    Ingredients
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {foodItem.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customizations Group */}
              {foodItem.customizations && foodItem.customizations.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  {foodItem.customizations.map((group) => (
                    <div key={group.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-gray-800">{group.title}</span>
                        {group.required && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {group.options.map((opt) => {
                          const isSelected = selectedCustomizations.some(
                            (c) => c.groupId === group.id && c.optionId === opt.id
                          );
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-50/50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type={group.type === 'single' ? 'radio' : 'checkbox'}
                                  name={group.id}
                                  checked={isSelected}
                                  onChange={() => handleCustomizationChange(group, opt.id)}
                                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-900">{opt.name}</span>
                              </div>
                              {opt.price > 0 && (
                                <span className="text-xs font-bold text-primary-700">
                                  +{formatCurrency(opt.price)}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                  Special Notes for Chef
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="E.g., Extra spicy, dressing on side..."
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600">Qty:</span>
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    disabled={!foodItem.isAvailable}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-colors shadow-xs ${
                      !foodItem.isAvailable
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                  <button
                    disabled={!foodItem.isAvailable}
                    onClick={() => setQuantity(quantity + 1)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition-colors shadow-xs ${
                      !foodItem.isAvailable
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!foodItem.isAvailable ? (
                <button
                  disabled
                  className="w-full sm:w-auto px-8 py-3.5 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed text-base shadow-sm"
                >
                  ✕ Currently Out of Stock
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-3 text-base shadow-lg"
                >
                  <span>Add to Cart</span>
                  <span className="font-black text-white/90">
                    {formatCurrency(calculateTotal())}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {foodItem.reviews && foodItem.reviews.length > 0 && (
          <div className="mt-12 bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {foodItem.reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{rev.userName}</span>
                    <RatingStars rating={rev.rating} size="sm" showNumber={false} />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                  <p className="text-xs text-gray-400 mt-3">{rev.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
