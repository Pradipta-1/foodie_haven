import React, { useState } from 'react';
import { Phone, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/mockData';
import { useToast } from '../context/ToastContext';

export default function ContactPage() {
  const { showSuccess } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Message sent successfully! We will get back to you soon.');
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] lg:min-h-screen pt-16 sm:pt-20 lg:pt-24 pb-20 lg:pb-12 bg-gray-50 flex flex-col justify-center sm:justify-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-3.5 sm:mb-6 lg:mb-10">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2.5">
            Get in Touch
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-1 sm:mb-3">
            We'd Love to Hear From You
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 line-clamp-2 sm:line-clamp-none">
            Have questions, feedback, or need help with your order? Reach out to us anytime!
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Desktop Left Column: Support Card */}
          <div className="hidden lg:block lg:col-span-4 space-y-5">
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-3xl p-6 shadow-md">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1.5">Need Immediate Help?</h3>
              <p className="text-white/85 text-sm mb-4 leading-relaxed">
                If you have an active order issue or need urgent assistance, give our support team a quick call.
              </p>
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="w-full inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Support ({RESTAURANT_INFO.phone})</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-gray-200 shadow-sm">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-5">
                Send us a Message
              </h2>

              {submitted && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl sm:rounded-2xl flex items-center gap-2 text-emerald-800 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-xs sm:text-sm font-medium">
                    Thank you! Your message has been sent successfully.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Rahul Sharma"
                      className="input-field py-2 sm:py-2.5 px-3 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="input-field py-2 sm:py-2.5 px-3 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="input-field py-2 sm:py-2.5 px-3 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Order inquiry"
                      className="input-field py-2 sm:py-2.5 px-3 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you need..."
                    className="input-field py-2 px-3 text-xs sm:text-sm resize-none h-20 sm:h-24"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full sm:w-auto px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow-md active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* Mobile-Only Support Strip: Balanced size to eliminate bottom white space */}
            <div className="block lg:hidden mt-3 sm:mt-4 p-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold leading-tight truncate">Need immediate help?</p>
                  <p className="text-[10px] sm:text-xs text-white/85 leading-tight truncate">Call our 24/7 support line</p>
                </div>
              </div>
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="shrink-0 bg-white text-primary-600 font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs active:scale-95 transition-transform"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
