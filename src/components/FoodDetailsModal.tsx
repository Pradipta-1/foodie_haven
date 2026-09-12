import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { FoodItem, SelectedCustomization, CartItemAddOn, CustomizationGroup } from '../types';
import { formatCurrency } from '../lib/utils';
import RatingStars from './RatingStars';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useFood } from '../context/FoodContext';

interface FoodDetailsModalProps {
  item: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FoodDetailsModal({ item: propItem, isOpen, onClose }: FoodDetailsModalProps) {
  const { getFoodById } = useFood();
  const item = (propItem ? getFoodById(propItem.id) : null) || propItem;

  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<CartItemAddOn[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { addToCart } = useCart();
  const { showWarning } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setQuantity(1);
      setSelectedCustomizations([]);
      setSelectedAddOns([]);
      setSpecialInstructions('');
    }
  }, [isOpen, item?.id]);

  if (!isOpen || !item) return null;

  const handleCustomizationChange = (group: CustomizationGroup, optionId: string) => {
    if (group.type === 'single') {
      // Replace any existing selection from this group
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
      // Multiple selection: toggle
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

  const isCustomizationSelected = (groupId: string, optionId: string) => {
    return selectedCustomizations.some((c) => c.groupId === groupId && c.optionId === optionId);
  };

  const isAddOnSelected = (addOnId: string) => {
    return selectedAddOns.some((a) => a.id === addOnId);
  };

  const calculateTotal = () => {
    let total = item.price;
    selectedCustomizations.forEach((c) => {
      total += c.price;
    });
    selectedAddOns.forEach((a) => {
      total += a.price;
    });
    return total * quantity;
  };

  const handleAddToCart = () => {
    // Validate required customizations
    if (item.customizations) {
      for (const group of item.customizations) {
        if (group.required) {
          const hasSelection = selectedCustomizations.some((c) => c.groupId === group.id);
          if (!hasSelection) {
            showWarning(`Please select ${group.title}`);
            return;
          }
        }
      }
    }

    addToCart({
      foodItem: item,
      quantity,
      customizations: selectedCustomizations,
      addOns: selectedAddOns,
      specialInstructions,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image */}
        <div className="relative h-64 sm:h-80 bg-gray-100">
          <img
            src={item.image}
            alt={item.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
            }}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Veg/Non-veg badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full border-2 ${
                item.isVeg ? 'border-green-600 bg-green-500' : 'border-red-600 bg-red-500'
              }`}
            />
            <span className="text-xs font-semibold text-gray-700">
              {item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-20rem)] p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{item.name}</h2>
                <p className="text-sm text-primary-600 font-medium mt-1">{item.category}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-gray-900">{formatCurrency(item.price)}</div>
                {item.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">{formatCurrency(item.originalPrice)}</div>
                )}
              </div>
            </div>

            <RatingStars rating={item.rating} size="md" count={item.ratingCount} />
            <p className="text-gray-600 mt-3 leading-relaxed">{item.description}</p>

            {item.calories && (
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-semibold">Calories:</span> {item.calories} kcal
              </p>
            )}
          </div>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Customizations */}
          {item.customizations && item.customizations.length > 0 && (
            <div className="space-y-4">
              {item.customizations.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{group.title}</h3>
                    {group.required && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={group.type === 'single' ? 'radio' : 'checkbox'}
                            name={group.id}
                            checked={isCustomizationSelected(group.id, option.id)}
                            onChange={() => handleCustomizationChange(group, option.id)}
                            className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-700 font-medium">{option.name}</span>
                        </div>
                        {option.price > 0 && (
                          <span className="text-sm font-semibold text-gray-600">
                            +{formatCurrency(option.price)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Add-Ons</h3>
              <div className="space-y-2">
                {item.addOns.map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isAddOnSelected(addOn.id)}
                        onChange={() => handleAddOnToggle(addOn)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="text-gray-700 font-medium">{addOn.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      +{formatCurrency(addOn.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block font-semibold text-gray-900 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="E.g., No onions, extra spicy, etc."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
            />
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center justify-center transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-md flex items-center justify-center transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            {!item.isAvailable ? (
              <button
                disabled
                className="flex-1 sm:flex-initial bg-gray-200 text-gray-500 font-bold py-3 px-8 min-w-[200px] rounded-xl cursor-not-allowed justify-center flex items-center gap-2"
              >
                ✕ Currently Out of Stock
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex-1 sm:flex-initial btn-primary text-base py-3 px-8 min-w-[200px] justify-center flex items-center gap-2 shadow-lg"
              >
                <span>Add to Cart</span>
                <span className="font-extrabold">{formatCurrency(calculateTotal())}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
