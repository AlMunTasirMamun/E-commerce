import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";

const BACKEND_URL = "http://localhost:5000";

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems, navigate, user, setShowUserLogin } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product) return null;

  // Calculate discount percentage
  const discountPercent = product.price > 0 
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
    : 0;

  // 🔥 IMAGE HANDLER (frontend + backend)
  const BASE_URL = import.meta.env.VITE_API_URL || "https://e-commerce-production-0858.up.railway.app";
  const imageSrc =
    typeof product.image?.[0] === "string"
      ? product.image[0].startsWith("http")
        ? product.image[0]
        : product.image[0].startsWith("/")
          ? `${BASE_URL}${product.image[0]}`
          : `${BASE_URL}/uploads/${product.image[0]}`
      : product.image?.[0];

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    // Add to cart if not already there
    if (!cartItems?.[product._id]) {
      addToCart(product._id);
    }
    // Navigate to cart for checkout
    navigate("/cart");
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        navigate(`/product/${product.category.toLowerCase()}/${product._id}`);
        window.scrollTo(0, 0);
      }}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 w-full"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
          -{discountPercent}%
        </div>
      )}

      {/* Stock Status Badge - Top Right */}
      {(product.stock === 0 || product.inStock === false) ? (
        <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
          Stock Out
        </div>
      ) : product.stock > 0 && product.stock <= 5 ? (
        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
          Only {product.stock} left!
        </div>
      ) : product.freeShipping ? (
        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          Free
        </div>
      ) : null}

      {/* IMAGE CONTAINER */}
      <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={product.name}
          className={`max-h-28 object-contain transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = assets.box_icon;
            setImageLoaded(true);
          }}
        />
        
        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-black/5 flex items-center justify-center gap-2 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.category.toLowerCase()}/${product._id}`);
            }}
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors text-sm"
            title="Quick View"
          >
            👁️
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-3">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full capitalize">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-gray-500">4.0</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 min-h-[40px] leading-5 mb-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {/* Price & Stock Row */}
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <span className="text-base font-bold text-gray-900">৳{product.offerPrice?.toLocaleString()}</span>
            {product.price > product.offerPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">৳{product.price?.toLocaleString()}</span>
            )}
          </div>
          {(product.stock === 0 || product.inStock === false) ? (
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>Out
            </span>
          ) : product.stock > 0 && product.stock <= 5 ? (
            <span className="text-xs font-semibold text-yellow-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>{product.stock} left
            </span>
          ) : (
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>In Stock
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add to Cart / Quantity */}
          {!cartItems?.[product._id] ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product._id);
              }}
              disabled={product.stock === 0 || product.inStock === false}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs">Add</span>
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-between bg-indigo-50 rounded-lg px-2 py-1"
            >
              <button 
                onClick={() => removeFromCart(product._id)}
                className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-indigo-600 font-bold hover:bg-indigo-100 transition-colors shadow-sm text-sm"
              >
                −
              </button>
              <span className="font-semibold text-indigo-700 text-sm">{cartItems[product._id]}</span>
              <button 
                onClick={() => addToCart(product._id)}
                className="w-6 h-6 flex items-center justify-center bg-white rounded-md text-indigo-600 font-bold hover:bg-indigo-100 transition-colors shadow-sm text-sm"
              >
                +
              </button>
            </div>
          )}

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0 || product.inStock === false}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-2 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
