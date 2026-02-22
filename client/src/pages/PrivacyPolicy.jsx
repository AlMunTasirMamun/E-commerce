const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">Last updated: January 21, 2026</p>
        </div>

        <div className="prose max-w-none space-y-8">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              IUBAT Marketplace ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Personal Information You Provide:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Name, email address, and phone number</li>
                  <li>Billing and shipping address</li>
                  <li>Payment information (processed securely)</li>
                  <li>Account login credentials</li>
                  <li>Communication preferences</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Information Automatically Collected:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>IP address and browser type</li>
                  <li>Pages visited and time spent</li>
                  <li>Cookies and similar technologies</li>
                  <li>Device information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Process orders and deliver products</li>
              <li>Send transactional emails and notifications</li>
              <li>Improve our website and services</li>
              <li>Respond to your inquiries</li>
              <li>Prevent fraud and secure our platform</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          {/* 4. Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
            <p className="text-gray-700 mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Service providers (payment processors, delivery partners)</li>
              <li>Business partners with your consent</li>
              <li>Law enforcement when legally required</li>
              <li>We do NOT sell your personal information to third parties</li>
            </ul>
          </section>

          {/* 5. Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures including SSL encryption, firewalls, and secure servers to protect your personal information from unauthorized access, alteration, or disclosure.
            </p>
          </section>

          {/* 6. Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-700">
              We use cookies to enhance your browsing experience. You can control cookie settings through your browser. Some features may not work properly if cookies are disabled.
            </p>
          </section>

          {/* 8. Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy periodically. We'll notify you of significant changes via email or prominent notice on our website. Your continued use constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 9. Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-700">
              For privacy concerns or requests, contact:<br/>
              <strong>Email:</strong> privacy@iubatmarketplace.com<br/>
              <strong>Phone:</strong> +880 1700-000000
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-indigo-50 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-3">Have questions about our privacy practices?</p>
          <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">
            Contact Privacy Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
