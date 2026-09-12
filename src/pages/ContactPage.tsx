import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
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
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            We'd Love to Hear From You
          </h1>
          <p className="text-lg text-gray-600">
            Have questions, feedback, or need help with your order? Reach out to us anytime!
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Details</h2>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Our Location</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{RESTAURANT_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-xl">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Phone Number</h3>
                  <p className="text-gray-600 text-sm">{RESTAURANT_INFO.phone}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Mon-Sun, 11am - 11pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-xl">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Email Address</h3>
                  <p className="text-gray-600 text-sm">{RESTAURANT_INFO.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">We usually reply within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Support info card */}
            <div className="bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-3xl p-8 shadow-lg">
              <MessageSquare className="w-10 h-10 mb-4 text-white/90" />
              <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
              <p className="text-white/80 text-sm mb-4">
                If you have an active order issue, please give us a quick call for instant assistance.
              </p>
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="inline-block bg-white text-primary-600 font-bold px-6 py-2.5 rounded-xl text-sm shadow hover:bg-gray-100 transition-colors"
              >
                Call Support Now
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              {submitted && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 animate-fade-in">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <p className="text-sm font-medium">
                    Thank you! Your message has been sent successfully. We'll be in touch shortly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Rahul Sharma"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul.sharma@example.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Order inquiry / Feedback"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what you need..."
                    className="input-field resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
