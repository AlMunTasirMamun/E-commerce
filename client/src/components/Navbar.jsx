import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    user,
    setUser,
    setShowUserLogin,
    navigate,
    searchQuery,
    setSearchQuery,
    cartCount,
    axios,
  } = useAppContext();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("/api/user/notifications");
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/user/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/user/notifications/read-all");
      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/user/logout");
      if (data.success) {
        setUser(null);
        navigate("/");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
    <nav className="sticky top-0 z-50">

      {/* Main Navbar */}
      <div className="bg-gradient-to-r from-indigo-200 via-purple-100 to-pink-100 shadow-md">
        <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-3">

          {/* LOGO */}
          <Link to="/" className="flex items-center group">
            <div className="bg-white p-1 rounded-full shadow-lg transition-transform group-hover:scale-105 ring-2 ring-white/50 overflow-hidden flex items-center justify-center">
              <img 
                src={assets.iubat_logo} 
                alt="IUBAT Marketplace" 
                className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover object-center scale-125"
                style={{maxWidth:'none'}}
              />
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-3">
            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              <Link 
                to="/" 
                className="px-4 py-2 text-sm font-bold text-gray-800 hover:text-indigo-700 hover:bg-white rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <Link 
                to="/products" 
                className="px-4 py-2 text-sm font-bold text-gray-800 hover:text-indigo-700 hover:bg-white rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products
              </Link>
              <Link 
                to="/contact-us" 
                className="px-4 py-2 text-sm font-bold text-gray-800 hover:text-indigo-700 hover:bg-white rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </Link>
                <Link 
                  to="/seller" 
                  className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-2 2-2 2-2-.896-2-2zm0 0v2m0-2V9m0 2h2m-2 0H10" />
                  </svg>
                  Seller Login
                </Link>
            </div>

            {/* SEARCH */}
            <div className="hidden lg:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full transition-all duration-200 ml-2 group focus-within:bg-white focus-within:border-purple-300">
              <svg className="w-4 h-4 text-indigo-400 group-focus-within:text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                className="bg-white outline-none text-sm w-40 focus:w-52 transition-all duration-300 placeholder-gray-400 text-gray-800 font-bold group-focus-within:text-indigo-700 group-focus-within:placeholder-indigo-400 border border-indigo-100 rounded-full px-3 py-1"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 ml-2">
              {/* CART */}
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2.5 hover:bg-indigo-100 rounded-full transition-all duration-200 group border border-indigo-200"
              >
                <svg className="w-5 h-5 text-white/90 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 text-white text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg animate-bounce border border-white">
                    {cartCount()}
                  </span>
                )}
            </button>

            {/* NOTIFICATIONS */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 hover:bg-indigo-100 rounded-full transition-all duration-200 group border border-indigo-200"
                >
                  <svg className="w-5 h-5 text-white/90 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 text-white text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg animate-pulse border border-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-14 bg-white border border-indigo-200 shadow-2xl rounded-2xl w-80 max-h-96 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-white/80 hover:text-white font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-72">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <span className="text-4xl mb-2 block">🔔</span>
                          <p className="text-gray-500 text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => {
                              if (!notification.isRead) markAsRead(notification._id);
                              if (notification.type === "refund_approved" || notification.type === "refund_rejected") {
                                navigate("/my-refunds");
                                setShowNotifications(false);
                              }
                            }}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-purple-50 transition-colors ${
                              !notification.isRead ? "bg-gradient-to-r from-purple-50 to-pink-50" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                                  notification.type === "refund_approved"
                                    ? "bg-green-500"
                                    : notification.type === "refund_rejected"
                                    ? "bg-red-500"
                                    : "bg-indigo-500"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-800">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1.5">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* USER */}
            {user ? (
              <div className="relative group ml-1">
                <button className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-full transition-all duration-200">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-pink-400/50">
                    {user.profilePicture ? (
                      <img
                        src={`http://localhost:5000/images/${user.profilePicture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 top-12 bg-white border border-gray-100 shadow-2xl rounded-xl w-48 py-2 transition-all duration-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-white/80 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                      onClick={() => navigate("/profile")}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </button>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                      onClick={() => navigate("/my-orders")}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </button>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                      onClick={() => navigate("/my-refunds")}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                      </svg>
                      My Refunds
                    </button>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                      onClick={() => navigate("/transactions")}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Transactions
                    </button>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                      onClick={logout}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowUserLogin(true)}
                className="ml-2 px-5 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Login
              </button>
            )}
          </div>
        </div>
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex items-center gap-3">
          {/* Mobile Search */}
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {/* Mobile Cart */}
          <button onClick={() => navigate("/cart")} className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full">
                {cartCount()}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setOpen(!open)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {open ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-gradient-to-b from-indigo-500 to-purple-500 border-t border-white/20 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2.5 rounded-full">
              <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent outline-none text-sm flex-1 text-white placeholder-white/60"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Mobile Nav Links */}
          <div className="py-2">
            <Link 
              onClick={() => setOpen(false)} 
              to="/" 
              className="flex items-center gap-3 px-6 py-3 text-white hover:bg-white/20 hover:text-yellow-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <Link 
              onClick={() => setOpen(false)} 
              to="/products"
              className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-white/10 hover:text-yellow-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              All Products
            </Link>
            <Link 
              onClick={() => setOpen(false)} 
              to="/contact-us"
              className="flex items-center gap-3 px-6 py-3 text-white/90 hover:bg-white/10 hover:text-yellow-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
              <Link 
                onClick={() => setOpen(false)} 
                to="/seller"
                className="flex items-center gap-3 px-6 py-3 text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-2 2-2 2-2-.896-2-2zm0 0v2m0-2V9m0 2h2m-2 0H10" />
                </svg>
                Seller Login
              </Link>
          </div>

          {/* Mobile User Actions */}
          <div className="border-t border-white/10 p-4">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-pink-400/50">
                    {user.profilePicture ? (
                      <img
                        src={`http://localhost:5000/images/${user.profilePicture}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-xs text-white/60">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { navigate("/profile"); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 hover:text-yellow-400 rounded-lg transition-colors"
                >
                  My Profile
                </button>
                <button 
                  onClick={() => { navigate("/my-orders"); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 hover:text-yellow-400 rounded-lg transition-colors"
                >
                  My Orders
                </button>
                <button 
                  onClick={() => { navigate("/my-refunds"); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 hover:text-yellow-400 rounded-lg transition-colors"
                >
                  My Refunds
                </button>
                <button 
                  onClick={() => { navigate("/transactions"); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10 hover:text-yellow-400 rounded-lg transition-colors"
                >
                  Transactions
                </button>
                <button 
                  onClick={() => { logout(); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setShowUserLogin(true); setOpen(false); }}
                className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-medium rounded-full shadow-lg"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
