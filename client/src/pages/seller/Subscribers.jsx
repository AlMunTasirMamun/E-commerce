import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Subscribers = () => {
  const { axios } = useContext(AppContext);
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubscribers = async () => {
    try {
      const { data } = await axios.get("/api/subscriber/all");
      if (data.success) {
        setSubscribers(data.subscribers);
        setStats(data.stats);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await axios.put(`/api/subscriber/toggle/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchSubscribers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update subscriber");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    
    try {
      const { data } = await axios.delete(`/api/subscriber/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchSubscribers();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete subscriber");
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

  // Filter subscribers
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "active" && sub.isActive) || 
      (filter === "inactive" && !sub.isActive);
    const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-10 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-indigo-100 p-2 rounded-lg">📧</span>
              Newsletter Subscribers
            </h1>
            <p className="text-gray-500 mt-1">Manage your newsletter subscriber list</p>
          </div>
          <button
            onClick={fetchSubscribers}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div 
          onClick={() => setFilter("all")}
          className={`p-5 rounded-xl cursor-pointer transition-all ${
            filter === "all" 
              ? "bg-indigo-600 text-white shadow-lg" 
              : "bg-white border border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-3xl font-bold ${filter === "all" ? "text-white" : "text-indigo-600"}`}>
                {stats.total}
              </p>
              <p className={`text-sm ${filter === "all" ? "text-indigo-100" : "text-gray-500"}`}>
                Total Subscribers
              </p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>
        <div 
          onClick={() => setFilter("active")}
          className={`p-5 rounded-xl cursor-pointer transition-all ${
            filter === "active" 
              ? "bg-green-600 text-white shadow-lg" 
              : "bg-white border border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-3xl font-bold ${filter === "active" ? "text-white" : "text-green-600"}`}>
                {stats.active}
              </p>
              <p className={`text-sm ${filter === "active" ? "text-green-100" : "text-gray-500"}`}>
                Active
              </p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>
        <div 
          onClick={() => setFilter("inactive")}
          className={`p-5 rounded-xl cursor-pointer transition-all ${
            filter === "inactive" 
              ? "bg-gray-600 text-white shadow-lg" 
              : "bg-white border border-gray-200 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-3xl font-bold ${filter === "inactive" ? "text-white" : "text-gray-600"}`}>
                {stats.inactive}
              </p>
              <p className={`text-sm ${filter === "inactive" ? "text-gray-100" : "text-gray-500"}`}>
                Unsubscribed
              </p>
            </div>
            <span className="text-4xl">⏸️</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                Subscribed Date
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSubscribers.map((subscriber) => (
              <tr key={subscriber._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-lg">
                      📧
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{subscriber.email}</p>
                      <p className="text-xs text-gray-500 md:hidden">
                        {formatDate(subscriber.subscribedAt)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm text-gray-600">
                    {formatDate(subscriber.subscribedAt)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                    subscriber.isActive 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {subscriber.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(subscriber._id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                        subscriber.isActive 
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {subscriber.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(subscriber._id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubscribers.length === 0 && (
          <div className="py-12 text-center">
            <span className="text-4xl">📭</span>
            <p className="mt-4 text-gray-500">No subscribers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribers;
