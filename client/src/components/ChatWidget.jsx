import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const ChatWidget = () => {
  const { axios, user, isChatOpen, setIsChatOpen } = useContext(AppContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen && user) {
      fetchMessages();
      // Reset unread when opening chat
      setUnreadCount(0);
      setLastSeenCount(messages.filter(m => m.type === "admin").length);
    }
  }, [isChatOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!axios || !user) return;
    
    const checkNewMessages = async () => {
      try {
        const { data } = await axios.get("/api/support/user/messages");
        if (data.success) {
          // Count admin replies
          let adminReplies = 0;
          (data.messages || []).forEach((msg) => {
            if (msg.adminReply) adminReplies++;
          });
          
          // If chat is closed, update unread count
          if (!isChatOpen) {
            const newReplies = adminReplies - lastSeenCount;
            if (newReplies > 0) {
              setUnreadCount(newReplies);
            }
          } else {
            // If chat is open, update messages
            const chatMessages = [];
            (data.messages || []).forEach((msg) => {
              chatMessages.push({
                id: msg._id + "-user",
                type: "user",
                text: msg.message,
                subject: msg.subject,
                time: msg.createdAt,
              });
              if (msg.adminReply) {
                chatMessages.push({
                  id: msg._id + "-admin",
                  type: "admin",
                  text: msg.adminReply,
                  time: msg.repliedAt,
                });
              }
            });
            chatMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
            setMessages(chatMessages);
            setLastSeenCount(adminReplies);
            setUnreadCount(0);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    const interval = setInterval(checkNewMessages, 5000);
    return () => clearInterval(interval);
  }, [axios, user, isChatOpen, lastSeenCount]);

  const fetchMessages = async () => {
    if (!axios || !user) {
      console.log("fetchMessages: axios or user not available", { axios: !!axios, user: !!user });
      return;
    }
    setLoading(true);
    try {
      console.log("Fetching user messages...");
      const { data } = await axios.get("/api/support/user/messages");
      console.log("User messages response:", data);
      if (data.success) {
        // Transform messages into chat format
        const chatMessages = [];
        (data.messages || []).forEach((msg) => {
          chatMessages.push({
            id: msg._id + "-user",
            type: "user",
            text: msg.message,
            subject: msg.subject,
            time: msg.createdAt,
          });
          if (msg.adminReply) {
            chatMessages.push({
              id: msg._id + "-admin",
              type: "admin",
              text: msg.adminReply,
              time: msg.repliedAt,
            });
          }
        });
        // Sort by time
        chatMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!user) {
      toast.error("Please login to send messages");
      return;
    }

    console.log("Sending message:", { name: user.name, email: user.email, message: newMessage });
    setSending(true);
    try {
      const { data } = await axios.post("/api/support/create", {
        name: user.name,
        email: user.email,
        subject: "Chat Message",
        message: newMessage,
      });
      console.log("Send response:", data);

      if (data.success) {
        setNewMessage("");
        fetchMessages();
        toast.success("Message sent!");
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Chat error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          isChatOpen 
            ? "bg-red-500 hover:bg-red-600 rotate-90" 
            : "bg-indigo-600 hover:bg-indigo-700 hover:scale-110"
        }`}
      >
        {isChatOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {/* Unread badge */}
        {!isChatOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Chat with Support</h3>
                <p className="text-indigo-200 text-xs">We typically reply within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-80 overflow-y-auto p-4 bg-gray-50">
            {!user ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-4xl mb-2">🔒</span>
                <p className="text-sm text-center">Please login to chat with our support team</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-4xl mb-2">👋</span>
                <p className="text-sm text-center">Hi {user.name}! How can we help you today?</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => {
                  const showDate = index === 0 || 
                    formatDate(msg.time) !== formatDate(messages[index - 1].time);
                  
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="text-center my-3">
                          <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full">
                            {formatDate(msg.time)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            msg.type === "user"
                              ? "bg-indigo-600 text-white rounded-br-md"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
                          }`}
                        >
                          {msg.type === "admin" && (
                            <p className="text-xs text-indigo-600 font-semibold mb-1">Admin</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.type === "user" ? "text-indigo-200" : "text-gray-400"
                          }`}>
                            {formatTime(msg.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {user && (
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
