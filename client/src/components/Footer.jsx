import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  const companyLinks = [
    { name: "About", path: "/about" },
    { name: "Careers", path: "/career" },
    { name: "Blog", path: "/blog" },
    { name: "Partners", path: "/partner" }
  ];

  const supportLinks = [
    { name: "Help Center", path: "/help-center" },
    { name: "Safety Information", path: "/safety-information" },
    { name: "Cancellation Options", path: "/cancellation-options" },
    { name: "Contact Us", path: "/contact-us" },
    { name: "Accessibility", path: "/accessibility" }
  ];

  const legalLinks = [
    { name: "Privacy", path: "/privacy" },
    { name: "Terms", path: "/terms" },
    { name: "Sitemap", path: "/sitemap" }
  ];

  return (

    
    <footer className="bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-gray-600">
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 pt-10 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* BRAND */}
          <div>
            {assets.iubat_logo ? (
              <img 
                src={assets.iubat_logo} 
                alt="IUBAT Marketplace" 
                className="h-14 w-auto mx-auto sm:mx-0"
              />
            ) : (
              <h1 className="text-xl font-bold text-center sm:text-left">
                <span className="text-green-700">IUBAT</span>
                <span className="text-orange-500"> MARKETPLACE</span>
              </h1>
            )}
            <p className="text-xs mt-2 leading-snug text-center sm:text-left">
              <b>We are committed to delivering the best online shopping
                experience with IUBAT Marketplace.</b>
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-4">
              {["instagram", "facebook", "twitter", "linkedin"].map((item) => (
                <div
                  key={item}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-indigo-500 hover:text-white transition cursor-pointer text-sm"
                >
                  <i className={`fab fa-৳{item}`}></i>
                </div>
              ))}
            </div>
          </div>

          {/* COMPANY */}
          <div>
            <p className="text-sm font-semibold text-gray-900">Company</p>
            <ul className="mt-2 space-y-1 text-xs">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="hover:text-indigo-500 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

         
          {/* SUPPORT */}
          <div>
            <p className="text-sm font-semibold text-gray-900">Support</p>
            <ul className="mt-2 space-y-1 text-xs">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="hover:text-indigo-500 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Stay Updated
            </p>
            <p className="text-xs mt-2 leading-snug">
              Subscribe for offers & updates.
            </p>

            <div className="flex items-center mt-3">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-1.5 text-xs rounded-l-full border border-gray-300 outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button className="px-4 py-1.5 text-xs bg-indigo-500 text-white rounded-r-full hover:bg-indigo-600 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-300" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>
            © {new Date().getFullYear()} IUBAT Marketplace. All rights reserved.
          </p>
          <ul className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className="hover:text-indigo-500 transition"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
