import React from 'react';
import { Clock, MapPin, Phone, Mail, Award, Users, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/mockData';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
            Our Story
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3">
            Welcome to Foodie Haven
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {RESTAURANT_INFO.description}
          </p>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10">
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
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex p-2.5 sm:p-3 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl mb-3">
                <value.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">{value.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{value.desc}</p>
            </div>
          ))}
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Visit Us</h2>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Location */}
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <MapPin className="w-5 h-5 text-primary-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5">Location</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{RESTAURANT_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <Phone className="w-5 h-5 text-primary-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5">Phone</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{RESTAURANT_INFO.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <Mail className="w-5 h-5 text-primary-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-0.5">Email</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{RESTAURANT_INFO.email}</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div>
              <div className="flex items-start gap-3 sm:gap-4 mb-3">
                <Clock className="w-5 h-5 text-primary-600 shrink-0 mt-1" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Opening Hours</h3>
              </div>
              <div className="space-y-1.5 text-xs sm:text-sm ml-8 sm:ml-9">
                {Object.entries(RESTAURANT_INFO.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="font-semibold text-gray-700 capitalize">{day}</span>
                    <span className="text-gray-600">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integrated Interactive Map */}
          <div className="mt-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">Restaurant Location Map</h3>
                  <p className="text-xs text-gray-500">{RESTAURANT_INFO.address}</p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(RESTAURANT_INFO.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow shrink-0"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
              <iframe
                title="Foodie Haven Restaurant Map"
                className="w-full h-full border-0"
                src="https://maps.google.com/maps?q=123%20MG%20Road,%20Bangalore,%20Karnataka%20560001&t=&z=15&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
