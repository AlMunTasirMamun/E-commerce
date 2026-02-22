const Partner = () => {
  const partners = [
    {
      id: 1,
      name: "Fast Logistics",
      category: "Delivery",
      description: "Reliable and fast delivery service across Bangladesh",
      icon: "🚚"
    },
    {
      id: 2,
      name: "SecurePayments Co",
      category: "Payment Gateway",
      description: "Safe and secure payment processing solutions",
      icon: "💳"
    },
    {
      id: 3,
      name: "CloudHost Pro",
      category: "Infrastructure",
      description: "Reliable cloud hosting and infrastructure services",
      icon: "☁️"
    },
    {
      id: 4,
      name: "Analytics Plus",
      category: "Analytics",
      description: "Advanced analytics and business intelligence tools",
      icon: "📊"
    },
    {
      id: 5,
      name: "Email Solutions",
      category: "Communication",
      description: "Professional email marketing and communication services",
      icon: "📧"
    },
    {
      id: 6,
      name: "Support Services",
      category: "Customer Support",
      description: "24/7 customer support and assistance services",
      icon: "🎧"
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Partners
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We work with trusted partners to deliver the best service to our customers
          </p>
        </div>

        {/* Partnership Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-indigo-600 mb-2">Become a Partner</h3>
            <p className="text-gray-600 mb-4">
              Join our growing network of partners and expand your business with IUBAT Marketplace
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Reach millions of customers</li>
              <li>✓ Dedicated partner support</li>
              <li>✓ Revenue sharing opportunities</li>
              <li>✓ Marketing support</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-purple-600 mb-2">Why Partner With Us?</h3>
            <p className="text-gray-600 mb-4">
              We offer competitive terms and a collaborative approach to business growth
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Flexible partnership models</li>
              <li>✓ Advanced technology platform</li>
              <li>✓ Growth opportunities</li>
              <li>✓ Transparent reporting</li>
            </ul>
          </div>
        </div>

        {/* Current Partners */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Current Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {partners.map((partner) => (
            <div 
              key={partner.id} 
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition hover:border-indigo-300"
            >
              <div className="text-4xl mb-4">{partner.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{partner.name}</h3>
              <p className="text-xs font-semibold text-indigo-600 mb-3">{partner.category}</p>
              <p className="text-sm text-gray-600">{partner.description}</p>
            </div>
          ))}
        </div>

        {/* Partnership Form */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 md:p-12 text-white">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Interested in Partnership?</h3>
            <p className="mb-6 text-indigo-100">
              Let's discuss how we can work together to create value for both our organizations
            </p>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Company Name"
                  className="px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-white"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <textarea
                placeholder="Tell us about your company and partnership interests"
                rows="4"
                className="w-full px-4 py-3 rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-white"
              ></textarea>
              <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition">
                Send Partnership Proposal
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partner;
