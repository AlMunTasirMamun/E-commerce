import { useAppContext } from '../context/AppContext';

const SafetyInformation = () => {
  const { setIsChatOpen } = useAppContext();
  const safetyTips = [
    {
      icon: "🔐",
      title: "Secure Password",
      description: "Use a strong, unique password with a mix of letters, numbers, and symbols. Never share your password with anyone."
    },
    {
      icon: "🛡️",
      title: "Verify Seller",
      description: "Check seller ratings and reviews before making a purchase. Look for verified seller badges."
    },
    {
      icon: "💳",
      title: "Safe Payments",
      description: "Only use our secure payment methods. Never send money via wire transfer or gift cards."
    },
    {
      icon: "🚨",
      title: "Report Issues",
      description: "If you encounter suspicious activity, report it immediately to our support team."
    },
    {
      icon: "📧",
      title: "Phishing Awareness",
      description: "Be cautious of emails asking for personal information. We'll never ask for passwords or bank details."
    },
    {
      icon: "✅",
      title: "Verify Authenticity",
      description: "Buy only from authorized sellers. Check product authenticity and packaging."
    }
  ];

  return (
    <>
      <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Safety Information
          </h1>
          <p className="text-lg text-gray-600">Your security is our top priority</p>
        </div>

        {/* Safety Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {safetyTips.map((tip, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{tip.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
              <p className="text-gray-600 text-sm">{tip.description}</p>
            </div>
          ))}
        </div>

        {/* Security Features */}
        <div className="bg-indigo-50 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-indigo-600 mb-2">🔒 Data Protection</h3>
              <p className="text-gray-700">We use SSL encryption and latest security protocols to protect your data.</p>
            </div>
            <div>
              <h3 className="font-bold text-indigo-600 mb-2">✓ Buyer Protection</h3>
              <p className="text-gray-700">Our buyer protection policy ensures safe transactions.</p>
            </div>
            <div>
              <h3 className="font-bold text-indigo-600 mb-2">📱 Two-Factor Authentication</h3>
              <p className="text-gray-700">Enable 2FA for additional account security.</p>
            </div>
            <div>
              <h3 className="font-bold text-indigo-600 mb-2">🔍 Fraud Detection</h3>
              <p className="text-gray-700">Our system monitors for suspicious activities 24/7.</p>
            </div>
          </div>
        </div>

        {/* What to Do If */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">What to Do If...</h2>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <h3 className="font-bold text-red-700 mb-2">Your Account is Compromised</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>✓ Change your password immediately</li>
              <li>✓ Review recent account activity</li>
              <li>✓ Enable two-factor authentication</li>
              <li>✓ Contact our support team if unauthorized transactions occurred</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
            <h3 className="font-bold text-yellow-700 mb-2">You Suspect Fraud</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>✓ Do not share sensitive information</li>
              <li>✓ Screenshot the suspicious activity</li>
              <li>✓ Report to us immediately</li>
              <li>✓ Block the suspicious account/seller</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h3 className="font-bold text-blue-700 mb-2">You Receive a Suspicious Email</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>✓ Do not click on links or download attachments</li>
              <li>✓ Forward to our support team</li>
              <li>✓ Never reply with personal information</li>
              <li>✓ Delete the email</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Have a security concern?</h3>
          <p className="mb-4">Report it to our security team immediately</p>
          <button onClick={() => setIsChatOpen(true)} className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition">
            Report Issue
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default SafetyInformation;
