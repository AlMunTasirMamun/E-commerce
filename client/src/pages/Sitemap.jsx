const Sitemap = () => {
  const siteStructure = [
    {
      section: "Main Pages",
      links: [
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name: "Cart", path: "/cart" },
        { name: "My Orders", path: "/my-orders" },
      ]
    },
    {
      section: "Company",
      links: [
        { name: "About", path: "/about" },
        { name: "Careers", path: "/career" },
        { name: "Blog", path: "/blog" },
        { name: "Partners", path: "/partner" },
      ]
    },
    {
      section: "Support",
      links: [
        { name: "Help Center", path: "/help-center" },
        { name: "Safety Information", path: "/safety-information" },
        { name: "Cancellation Options", path: "/cancellation-options" },
        { name: "Contact Us", path: "/contact-us" },
        { name: "Accessibility", path: "/accessibility" },
      ]
    },
    {
      section: "Legal",
      links: [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Sitemap", path: "/sitemap" },
      ]
    },
    {
      section: "Seller",
      links: [
        { name: "Seller Dashboard", path: "/seller" },
        { name: "Add Product", path: "/seller" },
        { name: "Product List", path: "/seller/product-list" },
        { name: "Orders", path: "/seller/orders" },
      ]
    },
    {
      section: "Product Categories",
      links: [
        { name: "Electronics", path: "/products/electronics" },
        { name: "Fashion", path: "/products/fashion" },
        { name: "Books", path: "/products/books" },
        { name: "Home & Garden", path: "/products/home" },
        { name: "Sports", path: "/products/sports" },
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sitemap
          </h1>
          <p className="text-lg text-gray-600">Navigate through all sections of IUBAT Marketplace</p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {siteStructure.map((section, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-indigo-600 mb-4">{section.section}</h2>
              <ul className="space-y-2">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.path}
                      className="text-gray-600 hover:text-indigo-600 transition text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-indigo-50 rounded-lg p-6">
            <h3 className="font-bold text-indigo-600 mb-3">📱 Mobile App</h3>
            <p className="text-gray-700 text-sm mb-3">Download our mobile app for easy shopping on the go</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition">
                iOS
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition">
                Android
              </button>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="font-bold text-purple-600 mb-3">🔗 External Links</h3>
            <p className="text-gray-700 text-sm mb-3">Connect with us on social media</p>
            <div className="flex gap-2">
              {["Facebook", "Instagram", "Twitter", "LinkedIn"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="px-3 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">1000+</div>
              <p className="text-gray-700 text-sm">Products Listed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <p className="text-gray-700 text-sm">Sellers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <p className="text-gray-700 text-sm">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <p className="text-gray-700 text-sm">Uptime</p>
            </div>
          </div>
        </div>

        {/* Quick Help */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-gray-700 mb-6">Use our search function or contact our support team</p>
          <div className="flex gap-4 justify-center">
            <input
              type="text"
              placeholder="Search sitemap..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
              Search
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Last updated: January 21, 2026</p>
          <p>For broken links or missing pages, please report to support@iubatmarketplace.com</p>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
