import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import PaymentModal from "../components/PaymentModal";

const Cart = () => {
  const {
    products,
    navigate,
    cartCount,
    totalCartAmount,
    cartItems,
    setCartItems,
    removeFromCart,
    updateCartItem,
    axios,
    user,
    setShowUserLogin,
  } = useAppContext();

  const [cartArray, setCartArray] = useState([]);
  const [address, setAddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddress, setShowAddress] = useState(false);

  // ADD ADDRESS
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isExpressDelivery, setIsExpressDelivery] = useState(false);

  // SHIPPING CALCULATION
  const SHIPPING_INSIDE_DHAKA = 60;
  const SHIPPING_OUTSIDE_DHAKA = 150;

  // Calculate shipping charge
  const calculateShipping = () => {
    if (cartArray.length === 0) return 0;
    
    // Check if all products have free shipping
    const allFreeShipping = cartArray.every(product => product.freeShipping);
    if (allFreeShipping) return 0;
    
    // Determine if address is in Dhaka
    if (!selectedAddress) return 0;
    
    const city = selectedAddress.city?.toLowerCase() || "";
    const isInsideDhaka = city.includes("dhaka");
    
    let baseShipping = isInsideDhaka ? SHIPPING_INSIDE_DHAKA : SHIPPING_OUTSIDE_DHAKA;
    
    // Double the shipping for express delivery
    if (isExpressDelivery) {
      baseShipping *= 2;
    }
    
    return baseShipping;
  };

  // Check if any product has free shipping
  const hasFreeShippingProducts = () => {
    return cartArray.some(product => product.freeShipping);
  };

  // Check if all products have free shipping
  const allProductsFreeShipping = () => {
    return cartArray.length > 0 && cartArray.every(product => product.freeShipping);
  };

  // Get final total
  const getFinalTotal = () => {
    const subtotal = totalCartAmount();
    const tax = subtotal * 0.05;
    const shipping = calculateShipping();
    return subtotal + tax + shipping;
  };

  // ---------------- CART ----------------
  useEffect(() => {
    if (products.length && cartItems) {
      const temp = [];
      for (const key in cartItems) {
        const product = products.find((p) => p._id === key);
        if (product) {
          temp.push({ ...product, quantity: cartItems[key] });
        }
      }
      setCartArray(temp);
    }
  }, [products, cartItems]);

  // ---------------- ADDRESS ----------------
  const getAddress = async () => {
    try {
      const { data } = await axios.get("/api/address/get");
      if (data.success) {
        setAddress(data.addresses);
        if (data.addresses.length) {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch {
      toast.error("Failed to load address");
    }
  };

  useEffect(() => {
    if (user) getAddress();
  }, [user]);

  const saveAddress = async () => {
    if (!user) {
      toast.error("Please login to add address");
      setShowUserLogin(true);
      return;
    }

    try {
      const { data } = await axios.post("/api/address/add", newAddress);
      if (data.success) {
        toast.success("Address added");
        setShowAddAddressForm(false);
        setNewAddress({ street: "", city: "", state: "", country: "" });
        getAddress();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Address add failed");
    }
  };

  // ---------------- ORDER ----------------
  const placeOrder = async () => {
    if (!user) {
      toast.error("Please login to place order");
      setShowUserLogin(true);
      return;
    }

    if (!selectedAddress) {
      return toast.error("Please select an address");
    }

    // Open payment modal instead of directly placing order
    setShowPaymentModal(true);
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <p className="mt-2 text-gray-500">
            {cartCount() > 0 ? (
              <>You have <span className="text-indigo-600 font-semibold">{cartCount()} item{cartCount() > 1 ? 's' : ''}</span> in your cart</>
            ) : (
              "Your cart is empty"
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT - Cart Items */}
          <div className="flex-1">
            {cartArray.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  <span>Product</span>
                  <span className="text-center">Price</span>
                  <span className="text-center">Subtotal</span>
                  <span className="w-10"></span>
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-gray-100">
                  {cartArray.map((product, index) => {
                    const discountPercent = product.price > product.offerPrice 
                      ? Math.round(((product.price - product.offerPrice) / product.price) * 100) 
                      : 0;
                    
                    return (
                      <div
                        key={product._id}
                        className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 p-6 items-center hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Product Info */}
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden group">
                            <img
                              src={`http://localhost:5000/images/${product.image[0]}`}
                              alt={product.name}
                              className="max-h-20 object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                            {discountPercent > 0 && (
                              <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors" onClick={() => navigate(`/product/${product.category.toLowerCase()}/${product._id}`)}>
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 capitalize">{product.category}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-500">Qty:</span>
                              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => product.quantity > 1 && updateCartItem(product._id, product.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                                >
                                  −
                                </button>
                                <span className="w-10 h-8 flex items-center justify-center text-sm font-medium bg-gray-50">
                                  {product.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartItem(product._id, product.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-center">
                          <p className="font-semibold text-gray-800">৳{product.offerPrice?.toLocaleString()}</p>
                          {product.price > product.offerPrice && (
                            <p className="text-sm text-gray-400 line-through">৳{product.price?.toLocaleString()}</p>
                          )}
                        </div>

                        {/* Subtotal */}
                        <div className="text-center">
                          <p className="font-bold text-lg text-indigo-600">
                            ৳{(product.offerPrice * product.quantity)?.toLocaleString()}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors mx-auto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Continue Shopping */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => navigate("/products")}
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - Order Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Delivery Address */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Address
                    </h3>
                  </div>

                  <div className="relative">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      {selectedAddress ? (
                        <div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.country}
                          </p>
                          <button
                            onClick={() => setShowAddress(!showAddress)}
                            className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Change Address
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-gray-500 text-sm mb-2">No address found</p>
                          <button
                            onClick={() => setShowAddAddressForm(true)}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            + Add New Address
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Address Dropdown */}
                    {showAddress && (
                      <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                        <div className="max-h-48 overflow-y-auto">
                          {address.map((a) => (
                            <div
                              key={a._id}
                              onClick={() => {
                                setSelectedAddress(a);
                                setShowAddress(false);
                              }}
                              className={`p-4 cursor-pointer hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 ${
                                selectedAddress?._id === a._id ? 'bg-indigo-50' : ''
                              }`}
                            >
                              <p className="text-sm text-gray-700">{a.street}, {a.city}</p>
                              <p className="text-xs text-gray-500">{a.state}, {a.country}</p>
                            </div>
                          ))}
                        </div>
                        <div
                          onClick={() => {
                            setShowAddAddressForm(true);
                            setShowAddress(false);
                          }}
                          className="p-4 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-indigo-600 font-medium text-sm flex items-center justify-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Address
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Address Form */}
                {showAddAddressForm && (
                  <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                    <h4 className="font-medium text-gray-800 text-sm">Add New Address</h4>
                    {["street", "city", "state", "country"].map((f) => (
                      <input
                        key={f}
                        placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                        value={newAddress[f]}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, [f]: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setShowAddAddressForm(false)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveAddress}
                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Subtotal
                      </span>
                      <span className="font-medium">৳{totalCartAmount()?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                        Tax (5%)
                      </span>
                      <span className="font-medium">৳{(totalCartAmount() * 0.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                        Shipping
                        {selectedAddress && !allProductsFreeShipping() && (
                          <span className="text-xs text-gray-400">
                            ({selectedAddress.city?.toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka'})
                          </span>
                        )}
                      </span>
                      {allProductsFreeShipping() ? (
                        <span className="font-medium text-green-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Free
                        </span>
                      ) : !selectedAddress ? (
                        <span className="font-medium text-orange-500 text-sm">Select address</span>
                      ) : (
                        <span className="font-medium">৳{calculateShipping()}</span>
                      )}
                    </div>
                    
                    {/* Shipping Info Notice */}
                    {!allProductsFreeShipping() && selectedAddress && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs">
                        <p className="text-blue-700 flex items-center gap-1">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {selectedAddress.city?.toLowerCase().includes('dhaka') 
                            ? `Inside Dhaka: ৳${isExpressDelivery ? '120 (Express)' : '60'} shipping charge` 
                            : `Outside Dhaka: ৳${isExpressDelivery ? '300 (Express)' : '150'} shipping charge`}
                        </p>
                        {hasFreeShippingProducts() && (
                          <p className="text-green-600 mt-1">Some items in your cart have free shipping!</p>
                        )}
                      </div>
                    )}

                    {/* Express Delivery Option */}
                    {!allProductsFreeShipping() && selectedAddress && (
                      <div className="mt-3">
                        <label 
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isExpressDelivery 
                              ? 'border-orange-400 bg-orange-50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isExpressDelivery}
                              onChange={(e) => setIsExpressDelivery(e.target.checked)}
                              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">⚡</span>
                                <span className="font-semibold text-gray-800">Express Delivery</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">Get your order faster! (1-2 days)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">+৳{selectedAddress.city?.toLowerCase().includes('dhaka') ? '60' : '150'}</p>
                            <p className="text-xs font-medium text-orange-600">2x shipping</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ৳{getFinalTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={placeOrder}
                  disabled={cartArray.length === 0}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    cartArray.length === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                  }`}
                >
                  {cartArray.length === 0 ? (
                    "Cart is Empty"
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Proceed to Payment
                    </>
                  )}
                </button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure checkout powered by SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cartItems={cartArray.map((i) => ({
          product: i._id,
          quantity: i.quantity,
        }))}
        selectedAddress={selectedAddress}
        totalAmount={totalCartAmount()}
        shippingAmount={calculateShipping()}
        isExpressDelivery={isExpressDelivery}
      />
    </div>
  );
};

export default Cart;
