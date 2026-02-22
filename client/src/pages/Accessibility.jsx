import { useState } from 'react';
import LiveChat from '../components/LiveChat';

const Accessibility = () => {
  const [showLiveChat, setShowLiveChat] = useState(false);
  return (
    <>
      <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Accessibility
          </h1>
          <p className="text-lg text-gray-600">Our commitment to inclusive online shopping</p>
        </div>

        {/* Accessibility Statement */}
        <div className="bg-indigo-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Statement</h2>
          <p className="text-gray-700 mb-4">
            IUBAT Marketplace is committed to making our website accessible to everyone, including people with disabilities. We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
          </p>
          <p className="text-gray-700">
            If you have difficulties accessing our website or services, please contact our accessibility team for assistance.
          </p>
        </div>

        {/* Accessibility Features */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">🎨 Visual Accessibility</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ High contrast color schemes</li>
              <li>✓ Resizable text options</li>
              <li>✓ Clear visual hierarchy</li>
              <li>✓ Alternative text for images</li>
              <li>✓ Support for zoom up to 200%</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">🔊 Audio Accessibility</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Screen reader compatible</li>
              <li>✓ Transcripts for videos</li>
              <li>✓ Keyboard navigation</li>
              <li>✓ Audio descriptions available</li>
              <li>✓ Captions for video content</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">⌨️ Navigation</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Full keyboard navigation</li>
              <li>✓ Skip navigation links</li>
              <li>✓ Logical tab order</li>
              <li>✓ Focus indicators</li>
              <li>✓ Search functionality</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">🧠 Cognitive</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Clear language</li>
              <li>✓ Simple navigation structure</li>
              <li>✓ Consistent layout</li>
              <li>✓ Helpful error messages</li>
              <li>✓ Step-by-step guidance</li>
            </ul>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-purple-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded">
              <p className="font-mono text-sm text-indigo-600 font-bold">Alt + H</p>
              <p className="text-sm text-gray-700">Home page</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="font-mono text-sm text-indigo-600 font-bold">Alt + S</p>
              <p className="text-sm text-gray-700">Search</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="font-mono text-sm text-indigo-600 font-bold">Alt + A</p>
              <p className="text-sm text-gray-700">Account</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="font-mono text-sm text-indigo-600 font-bold">Alt + C</p>
              <p className="text-sm text-gray-700">Cart</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="font-mono text-sm text-indigo-600 font-bold">Tab</p>
              <p className="text-sm text-gray-700">Navigate between elements</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="font-mono text-sm text-indigo-600 font-bold">Enter</p>
              <p className="text-sm text-gray-700">Activate buttons/links</p>
            </div>
          </div>
        </div>

        {/* Supported Assistive Technologies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Supported Technologies</h2>
          <div className="space-y-3">
            <p className="text-gray-700 flex items-center gap-2"><strong>✓ NVDA</strong> (Free screen reader for Windows)</p>
            <p className="text-gray-700 flex items-center gap-2"><strong>✓ JAWS</strong> (Industry standard screen reader)</p>
            <p className="text-gray-700 flex items-center gap-2"><strong>✓ VoiceOver</strong> (Built-in for Mac/iOS)</p>
            <p className="text-gray-700 flex items-center gap-2"><strong>✓ TalkBack</strong> (Built-in for Android)</p>
            <p className="text-gray-700 flex items-center gap-2"><strong>✓ Windows High Contrast</strong></p>
          </div>
        </div>

        {/* Report Issues */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Found an accessibility issue?</h3>
          <p className="mb-4">Help us improve our accessibility</p>
          <button onClick={() => setShowLiveChat(true)} className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition">
            Report Accessibility Issue
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>For accessibility assistance, contact: <strong>accessibility@iubatmarketplace.com</strong></p>
        </div>

        <LiveChat isOpen={showLiveChat} onClose={() => setShowLiveChat(false)} />
      </div>
    </div>
    </>
  );
};

export default Accessibility;
