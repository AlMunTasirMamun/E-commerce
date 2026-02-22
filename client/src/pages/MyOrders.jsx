import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyOrders } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

// Calculate refund amount based on time elapsed since order
// Tax is NOT refundable - only product price is eligible
const calculateRefundEstimate = (itemsTotal, orderCreatedAt) => {
  const now = new Date();
  const orderDate = new Date(orderCreatedAt);
  const hoursElapsed = (now - orderDate) / (1000 * 60 * 60);

  // itemsTotal is already the product price for selected items
  const productPrice = itemsTotal;
  // Calculate proportional tax (2% of product price)
  const taxAmount = Math.round(productPrice * 0.02);

  let deductionPercentage = 0;
  let deductionReason = "";

  if (hoursElapsed <= 1) {
    deductionPercentage = 0;
    deductionReason = "Within 1 hour - Full product price refund";
  } else if (hoursElapsed <= 6) {
    deductionPercentage = 5;
    deductionReason = "Within 6 hours - 5% processing fee";
  } else if (hoursElapsed <= 24) {
    deductionPercentage = 10;
    deductionReason = "Within 24 hours - 10% processing fee";
  } else if (hoursElapsed <= 48) {
    deductionPercentage = 15;
    deductionReason = "Within 48 hours - 15% processing fee";
  } else if (hoursElapsed <= 72) {
    deductionPercentage = 20;
    deductionReason = "Within 3 days - 20% processing fee";
  } else if (hoursElapsed <= 168) {
    deductionPercentage = 30;
    deductionReason = "Within 7 days - 30% processing fee";
  } else {
    deductionPercentage = 100;
    deductionReason = "Refund window expired - No refund available after 7 days";
  }

  const deductionAmount = Math.round((productPrice * deductionPercentage) / 100);
  const refundableAmount = productPrice - deductionAmount;

  return {
    originalAmount: productPrice + taxAmount,
    productPrice,
    taxAmount,
    deductionPercentage,
    deductionAmount,
    refundableAmount,
    deductionReason,
  };
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [refundReason, setRefundReason] = useState("");
  const [refundDescription, setRefundDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { axios, user } = useContext(AppContext);

  const refundReasons = [
    { value: "defective_product", label: "Defective Product" },
    { value: "wrong_item", label: "Wrong Item Received" },
    { value: "not_as_described", label: "Not As Described" },
    { value: "damaged_in_shipping", label: "Damaged in Shipping" },
    { value: "changed_mind", label: "Changed My Mind" },
    { value: "late_delivery", label: "Late Delivery" },
    { value: "other", label: "Other" },
  ];

  const fetchOrders = async () => {
    setPageLoading(true);
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPageLoading(false);
    }
  };

  const handleRefundRequest = async () => {
    if (!refundReason) {
      toast.error("Please select a reason for refund");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to refund");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/refund/request", {
        orderId: selectedOrder._id,
        reason: refundReason,
        description: refundDescription,
        items: selectedItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
      });

      if (data.success) {
        toast.success("Refund request submitted successfully");
        setShowRefundModal(false);
        setSelectedOrder(null);
        setSelectedItems([]);
        setRefundReason("");
        setRefundDescription("");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = (order) => {
    setSelectedOrder(order);
    // Initialize with only non-refunded items selected
    const refundableItems = order.items.filter(item => 
      !item.refundStatus || item.refundStatus === "none" || item.refundStatus === "rejected"
    );
    setSelectedItems(refundableItems.map(item => ({ ...item })));
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setSelectedOrder(null);
    setSelectedItems([]);
    setRefundReason("");
    setRefundDescription("");
  };

  const toggleItemSelection = (item) => {
    const isSelected = selectedItems.some(
      selected => selected.product._id === item.product._id
    );
    if (isSelected) {
      setSelectedItems(selectedItems.filter(
        selected => selected.product._id !== item.product._id
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item }]);
    }
  };

  const getSelectedItemsTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = item.product.offerPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const canRequestRefund = (order) => {
    const nonRefundableStatuses = [
      "Refunded",
      "Cancelled",
    ];
    
    // Check if order is within 7 days
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysSinceOrder = (now - orderDate) / (1000 * 60 * 60 * 24);
    const isWithin7Days = daysSinceOrder <= 7;
    
    // Check if there are any refundable items left
    const hasRefundableItems = order.items?.some(item => 
      !item.refundStatus || item.refundStatus === "none" || item.refundStatus === "rejected"
    );
    
    return !nonRefundableStatuses.includes(order.status) && isWithin7Days && hasRefundableItems;
  };

  // Check if refund window has expired (for showing message)
  const isRefundExpired = (order) => {
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysSinceOrder = (now - orderDate) / (1000 * 60 * 60 * 24);
    return daysSinceOrder > 7;
  };

  // Get remaining time for refund eligibility
  const getRefundTimeRemaining = (order) => {
    const orderDate = new Date(order.createdAt);
    const expiryDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const hoursRemaining = Math.max(0, (expiryDate - now) / (1000 * 60 * 60));
    
    if (hoursRemaining <= 0) return null;
    if (hoursRemaining < 24) return `${Math.floor(hoursRemaining)}h remaining`;
    return `${Math.floor(hoursRemaining / 24)}d remaining`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      "Order Placed": { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: "📋",
        step: 1 
      },
      "Confirmed": { 
        color: "bg-emerald-100 text-emerald-800 border-emerald-200", 
        icon: "✓",
        step: 2 
      },
      "Shipped": { 
        color: "bg-purple-100 text-purple-800 border-purple-200", 
        icon: "🚚",
        step: 3 
      },
      "Out for Delivery": { 
        color: "bg-orange-100 text-orange-800 border-orange-200", 
        icon: "📦",
        step: 4 
      },
      "Delivered": { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: "✓✓",
        step: 5 
      },
      "Refund Requested": { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: "⏳",
        step: 0 
      },
      "Refund Approved": { 
        color: "bg-orange-100 text-orange-800 border-orange-200", 
        icon: "↩",
        step: 0 
      },
      "Refunded": { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        icon: "💰",
        step: 0 
      },
      "Refund Rejected": { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: "✗",
        step: 0 
      },
      "Cancelled": { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: "✗",
        step: 0 
      },
    };
    return configs[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "•", step: 0 };
  };

  // Filter and sort orders
  const filteredOrders = myOrders
    .filter(order => {
      if (!order) return false;
      if (filter === "all") return true;
      if (filter === "active") return ["Order Placed", "Confirmed", "Shipped", "Out for Delivery"].includes(order.status);
      if (filter === "delivered") return order.status === "Delivered";
      if (filter === "refund") return ["Refund Requested", "Refund Approved", "Refunded", "Refund Rejected"].includes(order.status);
      return true;
    })
    .sort((a, b) => {
      // Only for refund filter: Prioritize "Refund Requested" (under review) at top
      if (filter === "refund") {
        const aIsUnderReview = a.status === "Refund Requested";
        const bIsUnderReview = b.status === "Refund Requested";
        
        if (aIsUnderReview && !bIsUnderReview) return -1;
        if (!aIsUnderReview && bIsUnderReview) return 1;
      }
      
      // For all filters: sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const orderStats = {
    total: myOrders.length,
    active: myOrders.filter(o => o && ["Order Placed", "Confirmed", "Shipped", "Out for Delivery"].includes(o.status)).length,
    delivered: myOrders.filter(o => o && o.status === "Delivered").length,
    refund: myOrders.filter(o => o && ["Refund Requested", "Refund Approved", "Refunded", "Refund Rejected"].includes(o.status)).length,
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Loading State
  if (pageLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="bg-indigo-100 p-2 rounded-lg">📦</span>
          My Orders
        </h1>
        <p className="text-gray-500 mt-2">Track and manage all your orders in one place</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div 
          onClick={() => setFilter("all")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${filter === "all" ? "bg-indigo-600 text-white shadow-lg scale-[1.02]" : "bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md"}`}
        >
          <p className={`text-2xl font-bold ${filter === "all" ? "text-white" : "text-indigo-600"}`}>{orderStats.total}</p>
          <p className={`text-sm ${filter === "all" ? "text-indigo-100" : "text-gray-500"}`}>Total Orders</p>
        </div>
        <div 
          onClick={() => setFilter("active")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${filter === "active" ? "bg-blue-600 text-white shadow-lg scale-[1.02]" : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md"}`}
        >
          <p className={`text-2xl font-bold ${filter === "active" ? "text-white" : "text-blue-600"}`}>{orderStats.active}</p>
          <p className={`text-sm ${filter === "active" ? "text-blue-100" : "text-gray-500"}`}>In Progress</p>
        </div>
        <div 
          onClick={() => setFilter("delivered")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${filter === "delivered" ? "bg-green-600 text-white shadow-lg scale-[1.02]" : "bg-white border border-gray-200 hover:border-green-300 hover:shadow-md"}`}
        >
          <p className={`text-2xl font-bold ${filter === "delivered" ? "text-white" : "text-green-600"}`}>{orderStats.delivered}</p>
          <p className={`text-sm ${filter === "delivered" ? "text-green-100" : "text-gray-500"}`}>Delivered</p>
        </div>
        <div 
          onClick={() => setFilter("refund")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${filter === "refund" ? "bg-orange-600 text-white shadow-lg scale-[1.02]" : "bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md"}`}
        >
          <p className={`text-2xl font-bold ${filter === "refund" ? "text-white" : "text-orange-600"}`}>{orderStats.refund}</p>
          <p className={`text-sm ${filter === "refund" ? "text-orange-100" : "text-gray-500"}`}>Refunds</p>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-700">No orders found</h3>
          <p className="text-gray-500 mt-2">
            {filter === "all" 
              ? "You haven't placed any orders yet. Start shopping!" 
              : `No orders in "${filter}" category`}
          </p>
          {filter !== "all" && (
            <button 
              onClick={() => setFilter("all")}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all orders →
            </button>
          )}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Order Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
                    <p className="font-mono text-sm font-medium text-gray-900">#{order._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Placed On</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                  <div className="hidden md:block h-8 w-px bg-gray-200"></div>
                  <div className="hidden md:block">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Payment</p>
                    <p className="text-sm font-medium text-gray-900">{order.paymentType || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusConfig(order.status).color}`}>
                    {getStatusConfig(order.status).icon} {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              {/* Order Tracking Progress */}
              {!["Refund Requested", "Refund Approved", "Refunded", "Refund Rejected", "Cancelled"].includes(order.status) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📍</span>
                    <h4 className="font-semibold text-gray-800">Track Your Order</h4>
                  </div>
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${((getStatusConfig(order.status).step - 1) / 4) * 100}%` }}
                      ></div>
                    </div>
                    
                    {/* Steps */}
                    <div className="relative flex justify-between">
                      {[
                        { step: 1, label: "Order Placed", icon: "📋", date: order.createdAt },
                        { step: 2, label: "Confirmed", icon: "✓", date: order.confirmedAt },
                        { step: 3, label: "Shipped", icon: "🚚", date: order.shippedAt },
                        { step: 4, label: "Out for Delivery", icon: "📦", date: order.outForDeliveryAt },
                        { step: 5, label: "Delivered", icon: "✓✓", date: order.deliveredAt },
                      ].map((item) => {
                        const currentStep = getStatusConfig(order.status).step;
                        const isCompleted = currentStep >= item.step;
                        const isCurrent = currentStep === item.step;
                        return (
                          <div key={item.step} className="flex flex-col items-center">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                isCompleted 
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200" 
                                  : "bg-gray-200 text-gray-500"
                              } ${isCurrent ? "ring-4 ring-indigo-200 scale-110" : ""}`}
                            >
                              {item.icon}
                            </div>
                            <p className={`mt-2 text-xs font-medium text-center max-w-[70px] ${
                              isCompleted ? "text-indigo-700" : "text-gray-400"
                            }`}>
                              {item.label}
                            </p>
                            {item.date && isCompleted && (
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Estimated Delivery */}
                  {order.status !== "Delivered" && order.estimatedDelivery && (
                    <div className="mt-4 pt-3 border-t border-indigo-200 flex items-center justify-center gap-2 text-sm text-indigo-700">
                      <span>🗓️</span>
                      <span>Estimated Delivery: <strong>{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong></span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 ${
                      order.items.length !== index + 1 ? "pb-4 border-b border-gray-100" : ""
                    } ${item.refundStatus === "refunded" ? "opacity-60" : ""}`}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden relative">
                      {item.product?.image?.[0] ? (
                        <img
                          src={`http://localhost:5000/images/${item.product.image[0]}`}
                          alt={item.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                      )}
                      {/* Refund overlay */}
                      {item.refundStatus === "refunded" && (
                        <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                          <span className="text-white text-xl">↩</span>
                        </div>
                      )}
                      {item.refundStatus === "pending" && (
                        <div className="absolute inset-0 bg-yellow-500/70 flex items-center justify-center">
                          <span className="text-white text-xl">⏳</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold truncate ${item.refundStatus === "refunded" ? "text-gray-500 line-through" : "text-gray-900"}`}>
                          {item.product?.name || 'Unknown Product'}
                        </h3>
                        {item.refundStatus && item.refundStatus !== "none" && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.refundStatus === "refunded" ? "bg-red-100 text-red-700" : 
                            item.refundStatus === "pending" ? "bg-yellow-100 text-yellow-700" : 
                            item.refundStatus === "rejected" ? "bg-gray-100 text-gray-600" : ""
                          }`}>
                            {item.refundStatus === "refunded" ? "Refunded" : 
                             item.refundStatus === "pending" ? "Refund Pending" : 
                             item.refundStatus === "rejected" ? "Refund Rejected" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{item.product?.category || ''}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">Qty: <span className="font-medium">{item.quantity || 1}</span></span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">Unit: <span className="font-medium">৳{item.product?.offerPrice || 0}</span></span>
                      </div>
                      {/* Write Review Button for Delivered Orders (only for non-refunded items) */}
                      {order.status === "Delivered" && item.product?._id && item.refundStatus !== "refunded" && (
                        <button
                          onClick={() => navigate(`/product/${item.product?.category?.toLowerCase() || 'all'}/${item.product._id}#reviews`)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Write Review
                        </button>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className={`text-lg font-bold ${item.refundStatus === "refunded" ? "text-red-500 line-through" : "text-gray-900"}`}>
                        ৳{(item.product?.offerPrice || 0) * (item.quantity || 1)}
                      </p>
                      {item.refundStatus === "refunded" && (
                        <p className="text-xs text-red-500">Refunded</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Order Total */}
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Items: {order.items?.length || 0}</p>
                    </div>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-indigo-600">৳{order.amount || 0}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {canRequestRefund(order) ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRefundModal(order)}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Request Refund
                        </button>
                        {getRefundTimeRemaining(order) && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            ⏰ {getRefundTimeRemaining(order)}
                          </span>
                        )}
                      </div>
                    ) : isRefundExpired(order) && !["Refund Requested", "Refund Approved", "Refunded", "Refund Rejected", "Cancelled"].includes(order.status) ? (
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                        ⏱️ Refund window expired (7 days)
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Refund Status Messages */}
                {order.status === "Refund Requested" && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="font-medium text-yellow-800">Refund Request Under Review</p>
                      <p className="text-sm text-yellow-700">We're processing your request. You'll be notified once it's resolved.</p>
                    </div>
                  </div>
                )}
                {order.status === "Refunded" && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <p className="font-medium text-green-800">Refund Processed Successfully</p>
                      <p className="text-sm text-green-700">The refund has been credited to your original payment method.</p>
                    </div>
                  </div>
                )}
                {order.status === "Refund Rejected" && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">✗</span>
                    <div>
                      <p className="font-medium text-red-800">Refund Request Rejected</p>
                      <p className="text-sm text-red-700">Please check your notifications for more details.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">↩️</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Request Refund</h3>
                    <p className="text-red-100 text-sm">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={closeRefundModal}
                  className="text-white/80 hover:text-white text-2xl font-light"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Select Items Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📦</span>
                  <h4 className="font-semibold text-gray-800">Select Items to Refund</h4>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
                  {selectedOrder.items
                    .filter(item => !item.refundStatus || item.refundStatus === "none" || item.refundStatus === "rejected")
                    .map((item, index) => {
                    const isSelected = selectedItems.some(
                      selected => selected.product._id === item.product._id
                    );
                    const itemPrice = item.product.offerPrice || item.product.price;
                    return (
                      <label
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-red-50 border-2 border-red-300" 
                            : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItemSelection(item)}
                          className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                        />
                        <img
                          src={item.product.image[0]}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.product.name}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × ৳{itemPrice}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-700">
                          ৳{itemPrice * item.quantity}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {selectedItems.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">Please select at least one item</p>
                )}
              </div>

              {/* Refund Estimate */}
              {selectedItems.length > 0 && (() => {
                const itemsTotal = getSelectedItemsTotal();
                const estimate = calculateRefundEstimate(itemsTotal, selectedOrder.createdAt);
                return (
                  <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">💰</span>
                      <h4 className="font-semibold text-gray-800">Refund Breakdown</h4>
                    </div>
                    <div className="space-y-3">
                      {/* Show each selected item */}
                      <div className="space-y-2 pb-3 border-b border-gray-200">
                        {selectedItems.map((item, idx) => {
                          const itemPrice = item.product.offerPrice || item.product.price;
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 truncate max-w-[200px]">
                                {item.product.name} × {item.quantity}
                              </span>
                              <span className="text-gray-700 font-medium">৳{itemPrice * item.quantity}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Subtotal */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Subtotal ({selectedItems.length} items)</span>
                        <span className="font-semibold text-gray-800">৳{estimate.productPrice}</span>
                      </div>
                      
                      {/* Deductions */}
                      <div className="pl-4 space-y-2 text-sm border-l-2 border-gray-300">
                        <div className="flex justify-between text-red-500">
                          <span className="flex items-center gap-1">
                            <span>⊘</span> Tax (Non-refundable)
                          </span>
                          <span>-৳{estimate.taxAmount}</span>
                        </div>
                        {estimate.deductionPercentage > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Processing Fee ({estimate.deductionPercentage}%)</span>
                            <span className="font-medium">-৳{estimate.deductionAmount}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Final Amount */}
                      <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-dashed border-gray-300">
                        <span className="font-semibold text-green-700">You'll Receive</span>
                        <span className="text-xl font-bold text-green-600">৳{estimate.refundableAmount}</span>
                      </div>
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-700">
                          ℹ️ {estimate.deductionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Refund To Account Info */}
              {selectedOrder.paymentAccount && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3">
                  <span className="text-2xl">🏦</span>
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Refund Destination</p>
                    <p className="text-blue-800 font-semibold">
                      {selectedOrder.paymentType} - {selectedOrder.paymentAccount.slice(0, 3)}****{selectedOrder.paymentAccount.slice(-3)}
                    </p>
                  </div>
                </div>
              )}

              {/* Refund Reason */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Refund <span className="text-red-500">*</span>
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white appearance-none cursor-pointer"
                >
                  <option value="">Select a reason...</option>
                  {refundReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Details */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Details <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={refundDescription}
                  onChange={(e) => setRefundDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows="3"
                  placeholder="Tell us more about why you want a refund..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{refundDescription.length}/500</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeRefundModal}
                  className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefundRequest}
                  disabled={loading || !refundReason || selectedItems.length === 0}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>Submit Request</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyOrders;
