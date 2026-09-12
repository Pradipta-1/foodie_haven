import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Clock, Truck, Shield, Award } from 'lucide-react';
import { MOCK_DEALS, TESTIMONIALS, FOOD_CATEGORIES } from '../data/mockData';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';
import { useFood } from '../context/FoodContext';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const { addToCart } = useCart();
  const { foodItems } = useFood();

  const popularItems = foodItems.filter((item) => item.isPopular).slice(0, 6);
  const featuredCategories = FOOD_CATEGORIES.filter((cat) => cat !== 'All').slice(0, 6);

  const handleQuickAdd = (item: FoodItem) => {
    addToCart({ foodItem: item, quantity: 1 });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-orange-50 to-accent-50 pt-24 sm:pt-28 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMTUwLDUwLDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold text-gray-700">Rated 4.8/5 by 10,000+ customers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Delicious Food,
                <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Delivered to Your Door
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Order from our curated menu featuring cuisine from around the world. Fresh ingredients, prepared daily by expert chefs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/menu')}
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
                >
                  Order Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/menu')}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  View Menu
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900">50+</div>
                  <div className="text-sm text-gray-600">Food Items</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900">30m</div>
                  <div className="text-sm text-gray-600">Avg. Delivery</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in animate-delay-200 hidden lg:block">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
                  alt="Delicious food spread"
                  className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                />
                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-primary-600" />
                    <div>
                      <div className="font-bold text-gray-900">Fast Delivery</div>
                      <div className="text-sm text-gray-500">Within 30 mins</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-float animation-delay-1000">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-emerald-600" />
                    <div>
                      <div className="font-bold text-gray-900">Quality Assured</div>
                      <div className="text-sm text-gray-500">100% Fresh</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Fast Delivery', desc: 'Get your food delivered in 30 minutes or less' },
              { icon: Star, title: 'Premium Quality', desc: 'Fresh ingredients sourced daily from local farms' },
              { icon: Shield, title: 'Safe & Hygienic', desc: 'Prepared in sanitized kitchens with care' },
              { icon: Award, title: 'Best Prices', desc: 'Enjoy great food at unbeatable prices' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="text-center p-6 rounded-2xl hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50 transition-all duration-300 group"
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Deals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Special Offers & Deals
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Limited time offers you don't want to miss!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_DEALS.map((deal) => (
              <div
                key={deal.id}
                className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-gradient-to-br ${deal.bgGradient}`}
              >
                <div className="absolute inset-0 bg-black/20" />
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-64 object-cover opacity-50"
                />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <span className="inline-block bg-white text-primary-600 font-bold text-xs px-3 py-1 rounded-full mb-3 w-fit">
                    {deal.discountBadge}
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{deal.title}</h3>
                  <p className="text-white/90 mb-4">{deal.subtitle}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
                      {deal.discountCode}
                    </span>
                    <button className="btn-secondary text-sm">
                      Apply Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Food Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our diverse menu categories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.map((category) => (
              <button
                key={category}
                onClick={() => navigate(`/menu?category=${category}`)}
                className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary-50 hover:to-accent-50 rounded-2xl border border-gray-200 hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-4xl mb-3">
                  {category === 'Burgers' && '🍔'}
                  {category === 'Pizza' && '🍕'}
                  {category === 'Pasta' && '🍝'}
                  {category === 'Biryani' && '🍛'}
                  {category === 'Starters' && '🥟'}
                  {category === 'Main Course' && '🍽️'}
                  {category === 'Desserts' && '🍰'}
                  {category === 'Beverages' && '🥤'}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {category}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Popular Dishes
              </h2>
              <p className="text-gray-600">Customer favorites you'll love</p>
            </div>
            <Link
              to="/menu"
              className="hidden sm:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularItems.map((item) => (
              <FoodCard
                key={item.id}
                item={item}
                onSelect={setSelectedFood}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
              View Full Menu
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real reviews from real food lovers
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{testimonial.comment}</p>
                <p className="text-xs text-gray-400 mt-3">{testimonial.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of satisfied customers. Get your favorite food delivered hot and fresh!
          </p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-lg text-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Start Ordering Now
          </button>
        </div>
      </section>

      {/* Food Details Modal */}
      <FoodDetailsModal
        item={selectedFood}
        isOpen={!!selectedFood}
        onClose={() => setSelectedFood(null)}
      />
    </div>
  );
}
