import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { axios } = useContext(AppContext);

  const statusOptions = [
    { value: "Order Placed", label: "Order Placed", icon: "📋" },
    { value: "Confirmed", label: "Confirmed", icon: "✓" },
    { value: "Shipped", label: "Shipped", icon: "🚚" },
    { value: "Out for Delivery", label: "Out for Delivery", icon: "📦" },
    { value: "Delivered", label: "Delivered", icon: "✓✓" },
    { value: "Cancelled", label: "Cancelled", icon: "✗" },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      "Order Placed": { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "📋" },
      "Confirmed": { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "✓" },
      "Shipped": { color: "bg-purple-100 text-purple-800 border-purple-200", icon: "🚚" },
      "Out for Delivery": { color: "bg-orange-100 text-orange-800 border-orange-200", icon: "📦" },
      "Delivered": { color: "bg-green-100 text-green-800 border-green-200", icon: "✓✓" },
      "Refund Requested": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "⏳" },
      "Refund Approved": { color: "bg-amber-100 text-amber-800 border-amber-200", icon: "↩" },
      "Refunded": { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "💰" },
      "Refund Rejected": { color: "bg-red-100 text-red-800 border-red-200", icon: "✗" },
      "Cancelled": { color: "bg-red-100 text-red-800 border-red-200", icon: "✗" },
    };
    return configs[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "•" };
  };

  const fetchOrders = async () => {
    if (!axios) return;
    setLoading(true);
    try {
      const { data } = await axios.get("/api/order/seller");
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!axios) return;
    setUpdatingOrder(orderId);
    try {
      const { data } = await axios.put(`/api/order/status/${orderId}`, {
        status: newStatus,
      });
      if (data.success) {
        toast.success("Order status updated");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const orderId = order._id?.toLowerCase() || "";
      const userName = order.address?.firstName?.toLowerCase() || "";
      const userLastName = order.address?.lastName?.toLowerCase() || "";
      const userEmail = order.userId?.email?.toLowerCase() || "";
      const userPhone = order.address?.phone?.toLowerCase() || "";
      const productNames = order.items?.map(item => item.product?.name?.toLowerCase() || "").join(" ") || "";
      
      const matchesSearch = 
        orderId.includes(query) ||
        userName.includes(query) ||
        userLastName.includes(query) ||
        userEmail.includes(query) ||
        userPhone.includes(query) ||
        productNames.includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filter === "all") return true;
    if (filter === "pending") return ["Order Placed", "Confirmed"].includes(order.status);
    if (filter === "shipping") return ["Shipped", "Out for Delivery"].includes(order.status);
    if (filter === "delivered") return order.status === "Delivered";
    if (filter === "express") return order.isExpressDelivery === true;
    if (filter === "refund") return ["Refund Requested", "Refund Approved", "Refunded", "Refund Rejected"].includes(order.status);
    return true;
  });

  // Sort orders: Refund Requested orders come first, then by date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    // Refund Requested orders come first
    const aIsRefundRequested = a.status === "Refund Requested" ? 1 : 0;
    const bIsRefundRequested = b.status === "Refund Requested" ? 1 : 0;
    if (aIsRefundRequested !== bIsRefundRequested) {
      return bIsRefundRequested - aIsRefundRequested;
    }
    // Then sort by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o && ["Order Placed", "Confirmed"].includes(o.status)).length,
    shipping: orders.filter((o) => o && ["Shipped", "Out for Delivery"].includes(o.status)).length,
    delivered: orders.filter((o) => o && o.status === "Delivered").length,
    express: orders.filter((o) => o && o.isExpressDelivery === true).length,
    refund: orders.filter((o) => o && ["Refund Requested", "Refund Approved", "Refunded", "Refund Rejected"].includes(o.status)).length,
  };

  // Calculate total revenue (product amount only - excludes shipping fees)
  const totalRevenue = orders
    .filter((o) => o && o.isPaid && !["Refunded", "Cancelled"].includes(o.status))
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  // Calculate total shipping costs separately
  const totalShippingCost = orders
    .filter((o) => o && o.isPaid && !["Refunded", "Cancelled"].includes(o.status))
    .reduce((sum, o) => sum + (o.shippingFee || 0), 0);

  // Shipping breakdown
  const shippingBreakdown = {
    freeDelivery: orders.filter((o) => o && o.isPaid && !["Refunded", "Cancelled"].includes(o.status) && (o.shippingFee === 0 || !o.shippingFee)).length,
    standardDelivery: orders.filter((o) => o && o.isPaid && !["Refunded", "Cancelled"].includes(o.status) && o.shippingFee > 0 && !o.isExpressDelivery).length,
    expressDelivery: orders.filter((o) => o && o.isPaid && !["Refunded", "Cancelled"].includes(o.status) && o.isExpressDelivery).length,
    standardRevenue: orders
      .filter((o) => o && o.isPaid && !["Refunded", "Cancelled"].includes(o.status) && o.shippingFee > 0 && !o.isExpressDelivery)
      .reduce((sum, o) => sum + (o.shippingFee || 0), 0),
    expressRevenue: orders
      .filter((o) => o && o.isPaid && !["Refunded", "Cancelled"].includes(o.status) && o.isExpressDelivery)
      .reduce((sum, o) => sum + (o.shippingFee || 0), 0),
  };

  useEffect(() => {
    if (axios) {
      fetchOrders();
    }
  }, [axios]);

  if (!axios) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Initializing...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-indigo-100 p-2 rounded-lg">📦</span>
              Order Management
            </h1>
            <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              <svg className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Total Revenue</p>
                <p className="text-xl font-bold text-green-700">৳{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200 relative group">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Shipping Cost</p>
                <p className="text-xl font-bold text-blue-700">৳{totalShippingCost.toLocaleString()}</p>
              </div>
              {/* Shipping Breakdown Tooltip */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <p className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">Shipping Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Free Delivery
                    </span>
                    <span className="text-sm font-medium text-gray-800">{shippingBreakdown.freeDelivery} orders</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Standard
                    </span>
                    <span className="text-sm font-medium text-gray-800">{shippingBreakdown.standardDelivery} orders (৳{shippingBreakdown.standardRevenue})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Express
                    </span>
                    <span className="text-sm font-medium text-gray-800">{shippingBreakdown.expressDelivery} orders (৳{shippingBreakdown.expressRevenue})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mb-8">
        <div
          onClick={() => setFilter("all")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === "all"
              ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
              : "bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md"
          }`}
        >
          <p className={`text-2xl font-bold ${filter === "all" ? "text-white" : "text-indigo-600"}`}>
            {orderStats.total}
          </p>
          <p className={`text-sm ${filter === "all" ? "text-indigo-100" : "text-gray-500"}`}>All Orders</p>
        </div>
        <div
          onClick={() => setFilter("pending")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === "pending"
              ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
              : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md"
          }`}
        >
          <p className={`text-2xl font-bold ${filter === "pending" ? "text-white" : "text-blue-600"}`}>
            {orderStats.pending}
          </p>
          <p className={`text-sm ${filter === "pending" ? "text-blue-100" : "text-gray-500"}`}>Pending</p>
        </div>
        <div
          onClick={() => setFilter("shipping")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === "shipping"
              ? "bg-purple-600 text-white shadow-lg scale-[1.02]"
              : "bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md"
          }`}
        >
          <p className={`text-2xl font-bold ${filter === "shipping" ? "text-white" : "text-purple-600"}`}>
            {orderStats.shipping}
          </p>
          <p className={`text-sm ${filter === "shipping" ? "text-purple-100" : "text-gray-500"}`}>Shipping</p>
        </div>
        <div
          onClick={() => setFilter("delivered")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === "delivered"
              ? "bg-green-600 text-white shadow-lg scale-[1.02]"
              : "bg-white border border-gray-200 hover:border-green-300 hover:shadow-md"
          }`}
        >
          <p className={`text-2xl font-bold ${filter === "delivered" ? "text-white" : "text-green-600"}`}>
            {orderStats.delivered}
          </p>
          <p className={`text-sm ${filter === "delivered" ? "text-green-100" : "text-gray-500"}`}>Delivered</p>
        </div>
        <div
          onClick={() => setFilter("express")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === "express"
              ? "bg-orange-500 text-white shadow-lg scale-[1.02]"
              : "bg-white border border-gray-200 hover:border-orange-300 hover:shadow-md"
          }`}
        >
          <p className={`text-2xl font-bold ${filter === "express" ? "text-white" : "text-orange-500"}`}>
            {orderStats.express}
          </p>
          <p className={`text-sm ${filter === "express" ? "text-orange-100" : "text-gray-500"}`}>⚡ Express</p>
        </div>
        <div
          onClick={() => setFilter("refund")}
          className={`p-4 rounded-xl cursor-pointer transition-all ${
            filter === "refund"
              ? "bg-red-600 text-white shadow-lg scale-[1.02]"
              : "bg-white border border-gray-200 hover:border-red-300 hover:shadow-md"
          }`}
        >
          <p className={`text-2xl font-bold ${filter === "refund" ? "text-white" : "text-red-600"}`}>
            {orderStats.refund}
          </p>
          <p className={`text-sm ${filter === "refund" ? "text-red-100" : "text-gray-500"}`}>Refunds</p>
        </div>
      </div>

      {/* Search Box */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by Order ID, customer name, email, phone, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Found {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700">No orders found</h3>
          <p className="text-gray-500 mt-2">
            {filter === "all" ? "You haven't received any orders yet." : `No orders in "${filter}" category`}
          </p>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
              View all orders →
            </button>
          )}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {sortedOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Order Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 md:px-6 py-4 border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
                    <p className="font-mono text-sm font-medium text-gray-900">#{order._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }) : "N/A"}
                    </p>
                  </div>
                  <div className="hidden md:block h-8 w-px bg-gray-200"></div>
                  <div className="hidden md:block">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Payment</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{order.paymentType || "N/A"}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Delivery Type Badge */}
                  {order.shippingFee === 0 || !order.shippingFee ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      🎁 Free Delivery
                    </span>
                  ) : order.isExpressDelivery ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                      ⚡ Express
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                      🚚 Standard
                    </span>
                  )}
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusConfig(order.status).color}`}
                  >
                    {getStatusConfig(order.status).icon} {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Content */}
            <div className="p-4 md:p-6">
              <div className="grid md:grid-cols-[1fr_auto] gap-6">
                {/* Left: Products & Customer */}
                <div className="space-y-4">
                  {/* Products */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Products</p>
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {item.product?.image?.[0] ? (
                              <img
                                src={`http://localhost:5000/images/${item.product.image[0]}`}
                                alt={item.product?.name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                            )}
                            {/* Refund badge on image */}
                            {item.refundStatus && item.refundStatus !== "none" && (
                              <div className={`absolute inset-0 flex items-center justify-center ${
                                item.refundStatus === "refunded" ? "bg-red-500/80" : 
                                item.refundStatus === "pending" ? "bg-yellow-500/80" : 
                                item.refundStatus === "rejected" ? "bg-gray-500/50" : "bg-gray-500/50"
                              }`}>
                                <span className="text-white text-xs font-bold">
                                  {item.refundStatus === "refunded" ? "↩" : 
                                   item.refundStatus === "pending" ? "⏳" : ""}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">{item.product?.name || "Unknown Product"}</p>
                              {item.refundStatus && item.refundStatus !== "none" && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
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
                            <p className="text-sm text-gray-500">
                              ৳{item.product?.offerPrice || 0} × {item.quantity || 1}
                            </p>
                          </div>
                          <p className={`font-semibold ${item.refundStatus === "refunded" ? "text-red-500 line-through" : "text-gray-900"}`}>
                            ৳{(item.product?.offerPrice || 0) * (item.quantity || 1)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info */}
                  {order.address && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Details</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-600 font-semibold">
                            {order.address.firstName?.charAt(0) || "?"}
                            {order.address.lastName?.charAt(0) || ""}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.address.firstName || ""} {order.address.lastName || ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {[order.address.street, order.address.city, order.address.state, order.address.zipcode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {order.address.phone && <p className="text-sm text-gray-500">📞 {order.address.phone}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracking Timeline */}
                  {(order.confirmedAt || order.shippedAt || order.outForDeliveryAt || order.deliveredAt) && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tracking Timeline</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-blue-600">
                          <span>📋</span>
                          <span>Order Placed: {new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        {order.confirmedAt && (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <span>✓</span>
                            <span>Confirmed: {new Date(order.confirmedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {order.shippedAt && (
                          <div className="flex items-center gap-2 text-purple-600">
                            <span>🚚</span>
                            <span>Shipped: {new Date(order.shippedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {order.outForDeliveryAt && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <span>📦</span>
                            <span>Out for Delivery: {new Date(order.outForDeliveryAt).toLocaleString()}</span>
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div className="flex items-center gap-2 text-green-600">
                            <span>✓✓</span>
                            <span>Delivered: {new Date(order.deliveredAt).toLocaleString()}</span>
                          </div>
                        )}
                        {order.estimatedDelivery && !order.deliveredAt && (
                          <div className="flex items-center gap-2 text-gray-500 mt-2 pt-2 border-t border-gray-100">
                            <span>🗓️</span>
                            <span>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Total & Actions */}
                <div className="md:border-l md:pl-6 border-gray-100 flex flex-col justify-between">
                  <div className="text-right mb-4">
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-indigo-600">৳{order.amount || 0}</p>
                    <p className="text-xs text-gray-400 mt-1">{order.items?.length || 0} item(s)</p>
                    {/* Shipping Fee Display */}
                    {(order.shippingFee > 0 || order.isExpressDelivery) && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Shipping Fee</p>
                        <p className={`text-sm font-semibold ${order.isExpressDelivery ? 'text-orange-600' : 'text-blue-600'}`}>
                          ৳{order.shippingFee || 0}
                          {order.isExpressDelivery && <span className="text-xs ml-1">(Express)</span>}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Update - Show for all orders except fully refunded/cancelled/delivered */}
                  {order.status !== "Refunded" && order.status !== "Cancelled" && order.status !== "Delivered" && (
                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Update Status {order.hasPartialRefund && <span className="text-orange-500">(Partial Refund)</span>}
                      </p>
                      <div className="relative">
                        <select
                          value={["Refund Requested", "Refund Approved", "Refund Rejected"].includes(order.status) ? "Order Placed" : order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={updatingOrder === order._id}
                          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {updatingOrder === order._id ? (
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Refund Notice */}
                  {order.status === "Refund Requested" && !order.hasPartialRefund && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800 font-medium">⚠️ Refund Requested</p>
                      <p className="text-xs text-yellow-700 mt-1">Review in Refunds section</p>
                    </div>
                  )}
                  
                  {/* Partial Refund Notice */}
                  {order.hasPartialRefund && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800 font-medium">📦 Partial Refund Order</p>
                      <p className="text-xs text-orange-700 mt-1">
                        Some items have been refunded. You can continue processing remaining items.
                      </p>
                    </div>
                  )}

                  {order.status === "Delivered" && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 font-medium">✓ Order Completed</p>
                      <p className="text-xs text-green-700 mt-1">Successfully delivered</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Orders;
