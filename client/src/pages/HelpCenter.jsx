import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const HelpCenter = () => {
  const navigate = useNavigate();
  const { setIsChatOpen } = useAppContext();
  const faqs = [
    {
      id: 1,
      question: "How do I place an order?",
      answer: "Browse products, add to cart, proceed to checkout, select payment method, and confirm your order. You'll receive a confirmation email immediately."
    },
    {
      id: 2,
      question: "What are the delivery times?",
      answer: "Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days in Dhaka area."
    },
    {
      id: 3,
      question: "Can I return items?",
      answer: "Yes, items can be returned within 7 days of delivery if they are in original condition with all packaging and tags intact."
    },
    {
      id: 4,
      question: "What payment methods do you accept?",
      answer: "We accept bKash, Nagad, Rocket, DBBL, Visa, MasterCard, and Cash on Delivery."
    },
    {
      id: 5,
      question: "How do I track my order?",
      answer: "Log into your account and go to 'My Orders'. You can see the status and tracking information for each order."
    },
    {
      id: 6,
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard SSL encryption to protect your payment information. All transactions are secure."
    }
  ];

  return (
    <>
      <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600">Find answers to common questions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="absolute right-3 top-3 text-indigo-600 font-semibold">
              🔍
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div 
            onClick={() => navigate('/my-orders')}
            className="bg-indigo-50 p-4 rounded-lg cursor-pointer hover:bg-indigo-100 transition border border-indigo-200 hover:border-indigo-400">
            <h3 className="font-semibold text-indigo-600 mb-1">📦 Orders & Delivery</h3>
            <p className="text-sm text-gray-600">Track, return, or cancel orders</p>
          </div>
          <div 
            onClick={() => navigate('/cancellation-options')}
            className="bg-purple-50 p-4 rounded-lg cursor-pointer hover:bg-purple-100 transition border border-purple-200 hover:border-purple-400">
            <h3 className="font-semibold text-purple-600 mb-1">💳 Payments</h3>
            <p className="text-sm text-gray-600">Payment methods and billing</p>
          </div>
          <div 
            onClick={() => setShowLiveChat(true)}
            className="bg-blue-50 p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition border border-blue-200 hover:border-blue-400">
            <h3 className="font-semibold text-blue-600 mb-1">👤 Account</h3>
            <p className="text-sm text-gray-600">Login, signup, and profile</p>
          </div>
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition">
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-lg text-indigo-600 group-open:rotate-180 transition">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-600 border-t border-gray-200">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
          <p className="mb-4">Contact our support team</p>
          <button onClick={() => setIsChatOpen(true)} className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition">
            Contact Support
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default HelpCenter;
