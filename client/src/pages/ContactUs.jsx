import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ContactUs = () => {
  const navigate = useNavigate();
  const { axios, user, setIsChatOpen } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const quickAnswers = [
    { title: "📦 Order Status", description: "Check your order details and tracking", link: "/my-orders" },
    { title: "💳 Payment Issues", description: "Troubleshoot payment problems", link: "/help-center" },
    { title: "🚚 Delivery", description: "Learn about our delivery options", link: "/cancellation-options" },
    { title: "↩️ Returns", description: "Start or track a return", link: "/cancellation-options" }
  ];

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
      fetchMyMessages();
    }
  }, [user]);

  const fetchMyMessages = async () => {
    if (!axios || !user) return;
    try {
      const { data } = await axios.get("/api/support/user/messages");
      if (data.success) {
        setMyMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/api/support/create", formData);
      if (data.success) {
        toast.success(data.message);
        setFormData(prev => ({
          ...prev,
          subject: "",
          message: "",
        }));
        if (user) fetchMyMessages();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/support/user/messages/${id}/read`);
      fetchMyMessages();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadReplies = myMessages.filter(m => m.adminReply && !m.userRead).length;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600">We'd love to hear from you. Get in touch with us today!</p>
        </div>

        {/* User Messages Toggle (for logged in users) */}
        {user && (
          <div className="mb-8">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <span>📨</span>
              <span>My Messages</span>
              {unreadReplies > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadReplies} new
                </span>
              )}
            </button>
          </div>
        )}

        {/* User's Messages Panel */}
        {showMessages && user && (
          <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Support Messages</h2>
            
            {myMessages.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages yet. Send us a message below!</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedMessage?._id === msg._id 
                        ? "border-indigo-500 bg-indigo-50" 
                        : "border-gray-200 hover:border-gray-300"
                    } ${msg.adminReply && !msg.userRead ? "ring-2 ring-green-400" : ""}`}
                    onClick={() => {
                      setSelectedMessage(selectedMessage?._id === msg._id ? null : msg);
                      if (msg.adminReply && !msg.userRead) {
                        markAsRead(msg._id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{msg.subject}</h3>
                        {msg.adminReply && !msg.userRead && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            New Reply!
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(msg.status)}`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{formatDate(msg.createdAt)}</p>
                    
                    {selectedMessage?._id === msg._id && (
                      <div className="mt-4 space-y-4">
                        {/* User's Message */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Your Message:</p>
                          <p className="text-sm text-gray-700">{msg.message}</p>
                        </div>
                        
                        {/* Admin Reply */}
                        {msg.adminReply ? (
                          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-xs text-green-700 font-semibold">Admin Reply:</p>
                              <p className="text-xs text-gray-500">{formatDate(msg.repliedAt)}</p>
                            </div>
                            <p className="text-sm text-gray-700">{msg.adminReply}</p>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-3">
                            <p className="text-sm text-yellow-700">
                              ⏳ Awaiting response from our support team...
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 text-sm mb-3">support@iubatmarketplace.com</p>
            <p className="text-xs text-gray-500">Response time: Within 24 hours</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600 text-sm mb-3">+880 1624-249877</p>
            <p className="text-xs text-gray-500">Mon-Sun: 9AM - 9PM</p>
          </div>
          <div 
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</div>
            <h3 className="text-lg font-bold text-indigo-900 mb-2">Live Chat</h3>
            <p className="text-indigo-600 text-sm mb-3 font-medium">Chat with our team now!</p>
            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-sm">
              Start Chat →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                <textarea
                  rows="5"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Office Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Office Information</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">📍 Head Office</h3>
                <p className="text-gray-600 text-sm">
                  IUBAT Marketplace<br/>
                  Bangladesh University of Business and Technology<br/>
                  Dhaka, Bangladesh
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">⏰ Business Hours</h3>
                <p className="text-gray-600 text-sm">
                  Monday - Friday: 9:00 AM - 6:00 PM<br/>
                  Saturday: 10:00 AM - 4:00 PM<br/>
                  Sunday: Closed
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">🔗 Follow Us</h3>
                <div className="flex gap-3">
                  {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-600 hover:text-white transition"
                    >
                      {social[0].toUpperCase()}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="bg-indigo-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Answers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickAnswers.map((item, index) => (
              <div 
                key={index}
                onClick={() => navigate(item.link)}
                className="bg-white p-4 rounded-lg cursor-pointer hover:shadow-md hover:border-indigo-400 transition border border-gray-200"
              >
                <p className="font-semibold text-indigo-600 mb-1">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
