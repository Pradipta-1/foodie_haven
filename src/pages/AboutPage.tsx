import React from 'react';
import { Clock, MapPin, Phone, Mail, Award, Users, Heart, Sparkles } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/mockData';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to Foodie Haven
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {RESTAURANT_INFO.description}
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
            alt="Restaurant interior"
            className="rounded-3xl shadow-lg w-full h-80 object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80"
            alt="Chef cooking"
            className="rounded-3xl shadow-lg w-full h-80 object-cover"
          />
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: Award,
              title: 'Premium Quality',
              desc: 'Only the finest ingredients make it to your plate',
            },
            {
              icon: Users,
              title: 'Expert Chefs',
              desc: 'Trained professionals with years of culinary experience',
            },
            {
              icon: Heart,
              title: 'Made with Love',
              desc: 'Every dish is prepared with passion and care',
            },
            {
              icon: Sparkles,
              title: 'Fresh Daily',
              desc: 'We source and prepare ingredients fresh every morning',
            },
          ].map((value, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex p-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl mb-4">
                <value.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{value.title}</h3>
              <p className="text-sm text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Visit Us</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Location */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Location</h3>
                  <p className="text-gray-600">{RESTAURANT_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                  <p className="text-gray-600">{RESTAURANT_INFO.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">{RESTAURANT_INFO.email}</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <Clock className="w-6 h-6 text-primary-600 shrink-0 mt-1" />
                <h3 className="font-bold text-gray-900">Opening Hours</h3>
              </div>
              <div className="space-y-2 text-sm ml-10">
                {Object.entries(RESTAURANT_INFO.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 capitalize">{day}</span>
                    <span className="text-gray-600">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mt-8 bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold">Map View</p>
              <p className="text-xs">Integrated map would display here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
