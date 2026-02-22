import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Support = () => {
  const { axios } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const chatEndRef = useRef(null);
  const selectedEmailRef = useRef(null);

  // Track selected email in ref for polling
  useEffect(() => {
    selectedEmailRef.current = selectedConversation?.email || null;
  }, [selectedConversation]);

  // Group messages by email into conversations
  const groupMessagesByUser = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const key = msg.email;
      if (!grouped[key]) {
        grouped[key] = {
          email: msg.email,
          name: msg.name,
          userId: msg.userId,
          messages: [],
          lastMessage: null,
          unreadCount: 0,
          hasUnreplied: false,
        };
      }
      grouped[key].messages.push(msg);
      if (!msg.isRead) grouped[key].unreadCount++;
      if (!msg.adminReply) grouped[key].hasUnreplied = true;
    });

    // Sort messages within each conversation and set last message
    Object.values(grouped).forEach((conv) => {
      conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      conv.lastMessage = conv.messages[conv.messages.length - 1];
    });

    // Sort conversations by last message date (newest first)
    return Object.values(grouped).sort(
      (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );
  };

  const fetchMessages = async () => {
    if (!axios) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let url = "/api/support/admin/messages";
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      if (searchQuery) params.append("search", searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const { data } = await axios.get(url);
      if (data.success) {
        setMessages(data.messages || []);
        const grouped = groupMessagesByUser(data.messages || []);
        setConversations(grouped);
        setStats(data.stats || {});
        
        // Update selected conversation if it exists
        if (selectedConversation) {
          const updated = grouped.find((c) => c.email === selectedConversation.email);
          if (updated) setSelectedConversation(updated);
        }
      }
    } catch (error) {
      console.error("Support fetch error:", error);
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [axios, filter]);

  // Auto-refresh every 3 seconds for real-time updates
  useEffect(() => {
    if (!axios) return;
    const interval = setInterval(() => {
      fetchMessagesQuiet();
    }, 3000);
    return () => clearInterval(interval);
  }, [axios, filter, searchQuery]);

  // Quiet fetch without loading state (for polling)
  const fetchMessagesQuiet = async () => {
    if (!axios) return;
    try {
      let url = "/api/support/admin/messages";
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      if (searchQuery) params.append("search", searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const { data } = await axios.get(url);
      if (data.success) {
        setMessages(data.messages || []);
        const grouped = groupMessagesByUser(data.messages || []);
        setConversations(grouped);
        setStats(data.stats || {});
        
        // Use ref to get current selected email
        const currentEmail = selectedEmailRef.current;
        if (currentEmail) {
          const updated = grouped.find((c) => c.email === currentEmail);
          if (updated) setSelectedConversation(updated);
        }
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  };

  useEffect(() => {
    // Scroll to bottom of chat when conversation changes
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setSendingReply(true);
    try {
      const { data } = await axios.put(`/api/support/admin/messages/${messageId}/reply`, {
        reply: replyText,
        status: "resolved",
      });

      if (data.success) {
        toast.success("Reply sent successfully");
        setReplyText("");
        fetchMessages();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`/api/support/admin/messages/${messageId}/status`, { isRead: true });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    // Mark all unread messages in this conversation as read
    conv.messages.forEach((msg) => {
      if (!msg.isRead) markAsRead(msg._id);
    });
  };

  const formatDate = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now - msgDate;
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      return msgDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return msgDate.toLocaleDateString("en-US", { weekday: "short" });
    }
    return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatFullDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "in-progress": return "bg-blue-500";
      case "resolved": return "bg-green-500";
      case "closed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const statCards = [
    { label: "Total", value: stats.total || 0, color: "bg-indigo-500", icon: "📨", filterValue: "all" },
    { label: "Pending", value: stats.pending || 0, color: "bg-yellow-500", icon: "⏳", filterValue: "pending" },
    { label: "In Progress", value: stats.inProgress || 0, color: "bg-blue-500", icon: "🔄", filterValue: "in-progress" },
    { label: "Resolved", value: stats.resolved || 0, color: "bg-green-500", icon: "✅", filterValue: "resolved" },
  ];

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
          <p className="text-gray-600 text-sm">Chat with customers</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchMessages(); }}
          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            onClick={() => setFilter(stat.filterValue)}
            className={`bg-white rounded-lg shadow-sm border p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition ${
              filter === stat.filterValue ? "ring-2 ring-indigo-500 border-indigo-500" : ""
            }`}
          >
            <div className={`${stat.color} p-2 rounded-lg text-white text-sm`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Layout */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search & Filter */}
            <div className="p-3 border-b border-gray-200">
              <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                  🔍
                </button>
              </form>
              <div className="flex gap-1 flex-wrap">
                {["all", "pending", "in-progress", "resolved"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      filter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f === "all" ? "All" : f === "in-progress" ? "Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm">No conversations</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.email}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedConversation?.email === conv.email ? "bg-indigo-50 border-l-4 border-l-indigo-600" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold flex-shrink-0">
                        {conv.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{conv.name}</h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatDate(conv.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.email}</p>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {conv.lastMessage.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(conv.lastMessage.status)}`}></span>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                          {conv.hasUnreplied && (
                            <span className="text-xs text-orange-600">• Needs reply</span>
                          )}
                          <span className="text-xs text-gray-400">
                            {conv.messages.length} msg{conv.messages.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                      {selectedConversation.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{selectedConversation.name}</h2>
                      <p className="text-xs text-gray-500">{selectedConversation.email}</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-500">
                      {selectedConversation.messages.length} message{selectedConversation.messages.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                  {selectedConversation.messages.map((msg, index) => (
                    <div key={msg._id}>
                      {/* User Message */}
                      <div className="flex justify-start mb-2">
                        <div className="max-w-[70%]">
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                            <p className="text-xs font-semibold text-indigo-600 mb-1">{msg.subject}</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 ml-2">{formatFullDate(msg.createdAt)}</p>
                        </div>
                      </div>

                      {/* Admin Reply */}
                      {msg.adminReply && (
                        <div className="flex justify-end mb-2">
                          <div className="max-w-[70%]">
                            <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-3 shadow-sm">
                              <p className="text-sm whitespace-pre-wrap">{msg.adminReply}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 mr-2 text-right">
                              {formatFullDate(msg.repliedAt)} • Admin
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Reply prompt for unreplied messages */}
                      {!msg.adminReply && index === selectedConversation.messages.length - 1 && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                            ⚠️ Awaiting your reply
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <textarea
                      rows="2"
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          const lastMsg = selectedConversation.messages[selectedConversation.messages.length - 1];
                          if (replyText.trim()) handleReply(lastMsg._id);
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <button
                      onClick={() => {
                        const lastMsg = selectedConversation.messages[selectedConversation.messages.length - 1];
                        handleReply(lastMsg._id);
                      }}
                      disabled={sendingReply || !replyText.trim()}
                      className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingReply ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>
                          Send
                          <span>➤</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <p className="text-6xl mb-4">💬</p>
                <p className="font-medium text-lg">Select a conversation</p>
                <p className="text-sm mt-1">Choose a customer from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
