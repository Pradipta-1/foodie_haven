import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Phone, Mail, MapPin, Heart, ArrowRight } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/mockData';

export default function Footer() {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-xl">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Foodie Haven</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {RESTAURANT_INFO.description}
            </p>
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                Accepted Payment Methods
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-400">
                <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700">UPI / QR</span>
                <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700">Credit Card</span>
                <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700">Debit Card</span>
                <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700">Cash On Delivery</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-base">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-primary-400 transition-colors">
                  Browse Menu
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-400 transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary-400 transition-colors">
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-base">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <span>{RESTAURANT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <span>{RESTAURANT_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <span>{RESTAURANT_INFO.email}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-base">Get Offers & Deals</h3>
            <p className="text-sm text-gray-400">
              Subscribe to our newsletter for exclusive weekly discounts and secret menu items.
            </p>
            <form onSubmit={handleNewsletter} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 pr-10"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-md transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-400 font-medium animate-fade-in">
                  🎉 Thank you for subscribing! Check your inbox for a 20% coupon.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Foodie Haven Restaurant. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for delicious food lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
