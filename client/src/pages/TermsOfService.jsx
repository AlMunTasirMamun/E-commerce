const TermsOfService = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500">Last updated: January 21, 2026</p>
        </div>

        <div className="prose max-w-none space-y-8">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700">
              By accessing and using IUBAT Marketplace, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* 2. Use License */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-3">Permission is granted to temporarily download one copy of the materials (information or software) on IUBAT Marketplace for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" on any other server</li>
            </ul>
          </section>

          {/* 3. Product Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Product Information</h2>
            <p className="text-gray-700">
              We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free. If a product is listed at an incorrect price due to typographical error, we have the right to refuse or cancel orders.
            </p>
          </section>

          {/* 4. Ordering & Payment */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ordering & Payment</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>You must be at least 18 years old to place an order</li>
              <li>You agree to provide accurate and complete information</li>
              <li>All purchases are binding contracts</li>
              <li>We reserve the right to refuse any order</li>
              <li>Prices are in Bangladeshi Taka (৳) and may change without notice</li>
            </ul>
          </section>

          {/* 5. Delivery & Risk */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Delivery & Risk of Loss</h2>
            <p className="text-gray-700 mb-3">
              • Delivery timeframes are estimates and not guaranteed<br/>
              • Risk of loss passes to you upon delivery<br/>
              • We are not responsible for delays beyond our control<br/>
              • In case of non-delivery, contact our support team
            </p>
          </section>

          {/* 6. Returns & Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Returns & Refunds</h2>
            <p className="text-gray-700 mb-3">Please refer to our Cancellation & Return Policy for complete details. Items may be returned within 7 days of delivery if:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>They are unused and in original condition</li>
              <li>They are in original packaging with tags attached</li>
              <li>They are accompanied by proof of purchase</li>
            </ul>
          </section>

          {/* 7. User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Accounts</h2>
            <p className="text-gray-700 mb-3">If you create an account on IUBAT Marketplace:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>You are responsible for maintaining confidentiality of your password</li>
              <li>You are responsible for all activities under your account</li>
              <li>You agree to provide accurate contact information</li>
              <li>We may suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          {/* 8. Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Activities</h2>
            <p className="text-gray-700 mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Engage in fraudulent transactions</li>
              <li>Violate any laws or regulations</li>
              <li>Harass or abuse other users</li>
              <li>Post false or misleading information</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Engage in price manipulation or reselling</li>
            </ul>
          </section>

          {/* 9. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700">
              To the fullest extent permitted by law, IUBAT Marketplace shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the website or services.
            </p>
          </section>

          {/* 10. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Intellectual Property Rights</h2>
            <p className="text-gray-700">
              All content on IUBAT Marketplace including text, graphics, logos, images, and software is the property of IUBAT Marketplace or its content suppliers. Unauthorized reproduction is prohibited.
            </p>
          </section>

          {/* 11. Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
            <p className="text-gray-700">
              Any disputes arising from these terms shall be governed by the laws of Bangladesh. You agree to submit to the exclusive jurisdiction of courts located in Dhaka, Bangladesh.
            </p>
          </section>

          {/* 12. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Continued use of the website following changes constitutes your acceptance of the updated terms.
            </p>
          </section>

          {/* 13. Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these terms, contact:<br/>
              <strong>Email:</strong> legal@iubatmarketplace.com<br/>
              <strong>Phone:</strong> +880 1700-000000
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-indigo-50 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-3">Have questions about our terms?</p>
          <button className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition">
            Contact Legal Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
