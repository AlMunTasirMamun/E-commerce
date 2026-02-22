import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

const BACKEND_URL = "http://localhost:5000";

const SingleProduct = () => {
  const { products, navigate, addToCart, cartItems, removeFromCart, user, setShowUserLogin, axios } = useAppContext();
  const { id } = useParams();
  const [thumbnail, setThumbnail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, avgRating: 0, ratingBreakdown: {} });
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState({ hasDeliveredOrder: false, alreadyReviewed: false });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const product = products.find((product) => product._id === id);

  useEffect(() => {
    if (products.length > 0 && product) {
      const related = products.filter(
        (p) => p.category === product.category && p._id !== product._id
      );
      setRelatedProducts(related.slice(0, 5));
    }
  }, [products, product]);

  useEffect(() => {
    if (product?.image?.[0]) {
      setThumbnail(product.image[0]);
    }
  }, [product]);

  useEffect(() => {
    // Reset quantity when product changes
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  // Handle hash navigation to reviews tab
  useEffect(() => {
    if (window.location.hash === "#reviews") {
      setActiveTab("reviews");
      // Scroll to reviews section after a small delay
      setTimeout(() => {
        const reviewsSection = document.getElementById("reviews-section");
        if (reviewsSection) {
          reviewsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [id]);

  // Fetch reviews for the product
  const fetchReviews = async () => {
    if (!id) return;
    try {
      const { data } = await axios.get(`/api/review/product/${id}`);
      if (data.success) {
        setReviews(data.reviews);
        setReviewStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Check if user can review
  const checkCanReview = async () => {
    if (!user || !id) {
      setCanReview(false);
      setReviewEligibility({ hasDeliveredOrder: false, alreadyReviewed: false });
      return;
    }
    try {
      const { data } = await axios.get(`/api/review/can-review/${id}`);
      setCanReview(data.canReview);
      setReviewEligibility({
        hasDeliveredOrder: data.hasDeliveredOrder,
        alreadyReviewed: data.alreadyReviewed,
      });
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
    checkCanReview();
  }, [id, user]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowUserLogin(true);
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await axios.post("/api/review/create", {
        productId: id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });

      if (data.success) {
        toast.success(data.message);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: "", comment: "" });
        setCanReview(false);
        // Reviews need approval, so don't fetch immediately
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const discountPercent = product.price > 0 
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
    : 0;

  const getImageUrl = (image) => {
    if (!image) return assets.box_icon;
    if (image.startsWith("http")) return image;
    if (image.startsWith("/")) return image;
    return `${BACKEND_URL}/images/${image}`;
  };

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowUserLogin(true);
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product._id);
    }
    navigate("/cart");
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product._id);
    }
  };

  return (
    <div className="mt-12 mb-20 px-4 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8 flex-wrap">
        <Link to="/" className="text-gray-500 hover:text-indigo-600 transition">Home</Link>
        <span className="text-gray-300">/</span>
        <Link to="/products" className="text-gray-500 hover:text-indigo-600 transition">Products</Link>
        <span className="text-gray-300">/</span>
        <Link to={`/products/${product.category.toLowerCase()}`} className="text-gray-500 hover:text-indigo-600 transition capitalize">
          {product.category}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-indigo-600 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-2 md:pb-0">
            {product.image.map((image, index) => (
              <button
                key={index}
                onClick={() => setThumbnail(image)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  thumbnail === image 
                    ? "border-indigo-600 shadow-lg" 
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = assets.box_icon; }}
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 relative">
            <div 
              className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden aspect-square cursor-zoom-in"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  -{discountPercent}% OFF
                </div>
              )}
              
              {/* Stock Badge */}
              {product.inStock === false && (
                <div className="absolute top-4 right-4 z-10 bg-gray-800 text-white text-sm font-medium px-3 py-1.5 rounded-full">
                  Out of Stock
                </div>
              )}

              <img
                src={getImageUrl(thumbnail)}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-300"
                style={{
                  transform: imageZoom ? "scale(1.5)" : "scale(1)",
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                }}
                onError={(e) => { e.target.src = assets.box_icon; }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Hover to zoom</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category Badge */}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit mb-3 capitalize">
            {product.category}
          </span>

          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i <= Math.round(reviewStats.avgRating) ? "text-yellow-400" : "text-gray-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-gray-500 text-sm">({reviewStats.avgRating || 0}) • {reviewStats.totalReviews || 0} Reviews</span>
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">৳{product.offerPrice?.toLocaleString()}</span>
              {product.price > product.offerPrice && (
                <span className="text-xl text-gray-400 line-through">৳{product.price?.toLocaleString()}</span>
              )}
            </div>
            {discountPercent > 0 && (
              <p className="text-green-600 font-medium text-sm">
                You save ৳{(product.price - product.offerPrice)?.toLocaleString()} ({discountPercent}% off)
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">Inclusive of all taxes</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-4">
            {product.inStock !== false ? (
              <>
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-600 font-medium">In Stock</span>
                <span className="text-gray-400 text-sm">• Ready to ship</span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Shipping Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${product.freeShipping ? 'bg-green-100' : 'bg-blue-100'}`}>
                <svg className={`w-5 h-5 ${product.freeShipping ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div>
                {product.freeShipping ? (
                  <>
                    <p className="font-semibold text-green-700 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Free Shipping
                    </p>
                    <p className="text-sm text-gray-500">This product ships free across Bangladesh</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-800">Shipping Charges</p>
                    <p className="text-sm text-gray-500">Inside Dhaka: ৳60 • Outside Dhaka: ৳150</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-xl font-medium"
                >
                  −
                </button>
                <span className="w-16 h-12 flex items-center justify-center font-semibold text-lg border-x-2 border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-xl font-medium"
                >
                  +
                </button>
              </div>
              <span className="text-gray-500 text-sm">
                Total: <span className="font-semibold text-gray-900">৳{(product.offerPrice * quantity)?.toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gray-100 text-gray-800 font-semibold rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.inStock === false}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Free Delivery</p>
                <p className="text-xs text-gray-500">On orders over ৳500</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">↩️</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Easy Returns</p>
                <p className="text-xs text-gray-500">7 days return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Secure Payment</p>
                <p className="text-xs text-gray-500">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Quality Assured</p>
                <p className="text-xs text-gray-500">Verified products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div id="reviews-section" className="mt-16">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 font-medium text-sm capitalize transition border-b-2 ${
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-2xl p-6">
          {activeTab === "description" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About this product</h3>
              <ul className="space-y-3">
                {product.description.map((desc, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-600">{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-800 capitalize">{product.category}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-medium text-gray-800">IUBAT Market</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">Availability</span>
                  <span className={`font-medium ${product.inStock !== false ? "text-green-600" : "text-red-600"}`}>
                    {product.inStock !== false ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-500">SKU</span>
                  <span className="font-medium text-gray-800">{product._id.slice(-8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              {/* Reviews Header with Stats */}
              <div className="flex flex-col lg:flex-row gap-8 mb-8">
                {/* Overall Rating */}
                <div className="lg:w-1/3 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <span className="text-5xl font-bold text-gray-900">{reviewStats.avgRating || 0}</span>
                    <div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i <= Math.round(reviewStats.avgRating) ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">{reviewStats.totalReviews} reviews</p>
                    </div>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 w-3">{star}</span>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{
                              width: `${reviewStats.totalReviews > 0 ? ((reviewStats.ratingBreakdown?.[star] || 0) / reviewStats.totalReviews) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-8">{reviewStats.ratingBreakdown?.[star] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write Review Section */}
                <div className="lg:w-2/3">
                  {!showReviewForm ? (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Share your thoughts</h4>
                      <p className="text-gray-500 text-sm mb-4">If you've used this product, share your thoughts with other customers</p>
                      {user ? (
                        canReview ? (
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                          >
                            Write a Review
                          </button>
                        ) : reviewEligibility.alreadyReviewed ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm font-medium">You have already reviewed this product.</p>
                          </div>
                        ) : !reviewEligibility.hasDeliveredOrder ? (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-yellow-500 text-xl">📦</span>
                              <div>
                                <p className="text-sm font-medium text-yellow-800">Purchase required</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                  You can only review products after they have been delivered to you. 
                                  <button 
                                    onClick={() => navigate("/products")}
                                    className="text-indigo-600 hover:underline ml-1"
                                  >
                                    Shop now
                                  </button>
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Unable to write review at this time.</p>
                        )
                      ) : (
                        <button
                          onClick={() => setShowUserLogin(true)}
                          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                        >
                          Login to Write Review
                        </button>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="bg-white rounded-xl p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-4">Write Your Review</h4>
                      
                      {/* Rating Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="focus:outline-none"
                            >
                              <svg
                                className={`w-8 h-8 transition ${star <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Title */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          placeholder="Sum up your review in a few words"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          maxLength={100}
                        />
                      </div>

                      {/* Review Comment */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="What did you like or dislike about this product?"
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          maxLength={1000}
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewForm({ rating: 5, title: "", comment: "" });
                          }}
                          className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">Your review will be visible after approval.</p>
                    </form>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="bg-white rounded-xl p-5 border border-gray-200">
                      <div className="flex items-start gap-4">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          {review.user?.profilePicture ? (
                            <img
                              src={review.user.profilePicture.startsWith("http") ? review.user.profilePicture : `${BACKEND_URL}/images/${review.user.profilePicture}`}
                              alt={review.user?.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold">
                                {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</h5>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          {/* Stars */}
                          <div className="flex gap-0.5 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>

                          <h6 className="font-medium text-gray-800 mb-1">{review.title}</h6>
                          <p className="text-gray-600 text-sm">{review.comment}</p>

                          {/* Admin Reply */}
                          {review.adminReply && (
                            <div className="mt-4 pl-4 border-l-2 border-indigo-200 bg-indigo-50 rounded-r-lg p-3">
                              <p className="text-xs font-semibold text-indigo-600 mb-1">Seller Response:</p>
                              <p className="text-sm text-gray-700">{review.adminReply}</p>
                              {review.adminRepliedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(review.adminRepliedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <span className="text-5xl mb-4 block">⭐</span>
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Related Products</h2>
            <p className="text-gray-500">You might also like these products</p>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {relatedProducts
              .filter((p) => p.inStock !== false)
              .map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => {
                navigate("/products");
                window.scrollTo(0, 0);
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition"
            >
              View All Products
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProduct;
