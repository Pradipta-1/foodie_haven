import React, { useState, useEffect } from 'react';
import { X, Save, Image, Plus, Trash2 } from 'lucide-react';
import { FoodItem, FoodCategory } from '../types';
import { FOOD_CATEGORIES } from '../data/mockData';

interface AdminFoodModalProps {
  item: FoodItem | null; // if null, creating a new item
  isOpen: boolean;
  onClose: () => void;
  onSave: (food: FoodItem) => void;
}

export default function AdminFoodModal({ item, isOpen, onClose, onSave }: AdminFoodModalProps) {
  const [formData, setFormData] = useState<Partial<FoodItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Burgers',
    image: '',
    isVeg: true,
    rating: 4.5,
    ratingCount: 1,
    isAvailable: true,
    prepTimeMinutes: 20,
    ingredients: [],
  });

  const [ingredientInput, setIngredientInput] = useState('');

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        id: `food-${Date.now()}`,
        name: '',
        description: '',
        price: 9.99,
        category: 'Burgers',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
        isVeg: true,
        rating: 4.5,
        ratingCount: 1,
        isAvailable: true,
        prepTimeMinutes: 15,
        ingredients: ['Fresh Ingredients'],
      });
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), ingredientInput.trim()],
      }));
      setIngredientInput('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    onSave({
      id: formData.id || `food-${Date.now()}`,
      name: formData.name || '',
      description: formData.description || '',
      price: Number(formData.price),
      category: (formData.category as FoodCategory) || 'Burgers',
      image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
      isVeg: Boolean(formData.isVeg),
      rating: formData.rating || 4.5,
      ratingCount: formData.ratingCount || 10,
      isAvailable: formData.isAvailable ?? true,
      prepTimeMinutes: Number(formData.prepTimeMinutes) || 15,
      ingredients: formData.ingredients || [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Truffle Mushroom Burger"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as FoodCategory })}
                className="input-field"
              >
                {FOOD_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="input-field"
                placeholder="299"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Image URL
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/... or https://..."
                  className="input-field flex-1"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/chicken_cheese_burger.jpg';
                    }}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-gray-100"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Dietary Type
              </label>
              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                  <input
                    type="radio"
                    name="isVeg"
                    checked={formData.isVeg === true}
                    onChange={() => setFormData({ ...formData, isVeg: true })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-green-700">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                  <input
                    type="radio"
                    name="isVeg"
                    checked={formData.isVeg === false}
                    onChange={() => setFormData({ ...formData, isVeg: false })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-red-700">Non-Veg</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Prep Time (Minutes)
              </label>
              <input
                type="number"
                value={formData.prepTimeMinutes || 15}
                onChange={(e) => setFormData({ ...formData, prepTimeMinutes: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Delicious tender patty with special seasonings..."
                className="input-field resize-none"
              />
            </div>

            {/* Ingredients builder */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Ingredients List
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                  placeholder="e.g. Fresh Mozzarella"
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="btn-secondary py-2 px-4 text-xs flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.ingredients?.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium"
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="sm:col-span-2 pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isAvailable ?? true}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="font-bold text-sm text-gray-800">
                  Item is In Stock & Available for Ordering
                </span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-outline py-2 px-4 text-sm">
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>{item ? 'Update Item' : 'Save Dish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
