import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';
import { FOOD_CATEGORIES } from '../data/mockData';
import { FoodItem, FoodCategory } from '../types';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import { useCart } from '../context/CartContext';
import { useFood } from '../context/FoodContext';

type SortOption = 'featured' | 'popular' | 'rating' | 'price-asc' | 'price-desc';
type DietFilter = 'all' | 'veg' | 'non-veg';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') as FoodCategory) || 'All';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>(initialCategory);
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const { addToCart } = useCart();
  const { foodItems } = useFood();

  // Sync category state with searchParams if it changes externally
  useEffect(() => {
    const cat = searchParams.get('category') as FoodCategory;
    if (cat && FOOD_CATEGORIES.includes(cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (category: FoodCategory) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return foodItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Diet filter
      if (dietFilter === 'veg' && !item.isVeg) return false;
      if (dietFilter === 'non-veg' && item.isVeg) return false;

      // Available only filter
      if (availableOnly && !item.isAvailable) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesIngredients = item.ingredients?.some((ing) =>
          ing.toLowerCase().includes(query)
        );
        return matchesName || matchesDesc || matchesIngredients;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return (b.ratingCount || 0) - (a.ratingCount || 0);
        case 'featured':
        default:
          return 0; // Natural menu catalog order
      }
    });
  }, [foodItems, selectedCategory, dietFilter, availableOnly, searchQuery, sortBy]);

  const handleQuickAdd = (item: FoodItem) => {
    addToCart({ foodItem: item, quantity: 1 });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setDietFilter('all');
    setAvailableOnly(false);
    setSortBy('featured');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-22 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            Delicious Choices
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Explore Our Menu
          </h1>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm">
            Choose from a rich variety of hand-crafted delicacies made with fresh, quality ingredients.
          </p>
        </div>

        {/* Search & Main Controls */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200 mb-5 sm:mb-6 space-y-2.5 sm:space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-6 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by name, ingredients..."
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-1 lg:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm font-medium text-gray-700"
              >
                <option value="featured">Sort: Featured (Chef's Order)</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="price-asc">Sort: Price (Low to High)</option>
                <option value="price-desc">Sort: Price (High to Low)</option>
              </select>
            </div>

            {/* Dietary Type Filter */}
            <div className="sm:col-span-1 lg:col-span-3 flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setDietFilter('all')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dietFilter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('veg')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  dietFilter === 'veg'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-green-700 hover:bg-green-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span>Veg</span>
              </button>
              <button
                type="button"
                onClick={() => setDietFilter('non-veg')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  dietFilter === 'non-veg'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-red-700 hover:bg-red-50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                <span>Non-Veg</span>
              </button>
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none pt-1.5 border-t border-gray-100 -mx-1 px-1 sm:mx-0 sm:px-0">
            {FOOD_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    active
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Extra Toggle: Available only & Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-gray-500">
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="font-medium text-gray-700">Show available items only</span>
            </label>

            <div>
              Showing <span className="font-bold text-gray-900">{filteredItems.length}</span> dishes
            </div>
          </div>
        </div>

        {/* Results Grid / Empty State */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-gray-200 max-w-lg mx-auto my-8">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No food items found</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-4">
              We couldn't find any dishes matching your filters or search criteria.
            </p>
            <button onClick={clearFilters} className="btn-primary text-sm py-2 px-4">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onSelect={setSelectedFood}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </div>

      {/* Food Customization / Details Modal */}
      <FoodDetailsModal
        item={selectedFood}
        isOpen={!!selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </div>
  );
}
