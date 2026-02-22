import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const BACKEND_URL = "http://localhost:5000";

const Reviews = () => {
  const { axios } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, hidden: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [replyModal, setReplyModal] = useState({ show: false, review: null, reply: "" });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let url = "/api/review/admin/all?";
      if (filter !== "all") url += `status=${filter}&`;
      if (ratingFilter) url += `rating=${ratingFilter}&`;
      if (search) url += `search=${search}&`;

      const { data } = await axios.get(url);
      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter, ratingFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleApprove = async (reviewId) => {
    try {
      const { data } = await axios.put(`/api/review/admin/approve/${reviewId}`);
      if (data.success) {
        toast.success("Review approved");
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to approve review");
    }
  };

  const handleToggleHide = async (reviewId) => {
    try {
      const { data } = await axios.put(`/api/review/admin/toggle-hide/${reviewId}`);
      if (data.success) {
        toast.success(data.message);
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const { data } = await axios.delete(`/api/review/admin/delete/${reviewId}`);
      if (data.success) {
        toast.success("Review deleted");
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) {
      toast.error("Select reviews first");
      return;
    }
    try {
      const { data } = await axios.put("/api/review/admin/bulk-approve", {
        reviewIds: selectedReviews,
      });
      if (data.success) {
        toast.success(data.message);
        setSelectedReviews([]);
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to approve reviews");
    }
  };

  const handleReply = async () => {
    if (!replyModal.reply.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    try {
      const { data } = await axios.put(`/api/review/admin/reply/${replyModal.review._id}`, {
        reply: replyModal.reply,
      });
      if (data.success) {
        toast.success("Reply added");
        setReplyModal({ show: false, review: null, reply: "" });
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to add reply");
    }
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map((r) => r._id));
    }
  };

  const toggleSelectReview = (id) => {
    if (selectedReviews.includes(id)) {
      setSelectedReviews(selectedReviews.filter((r) => r !== id));
    } else {
      setSelectedReviews([...selectedReviews, id]);
    }
  };

  const getStatusBadge = (review) => {
    if (review.isHidden) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">Hidden</span>;
    }
    if (review.isApproved) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">Approved</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-600 rounded-full">Pending</span>;
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-500">Manage customer reviews and ratings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Hidden</p>
          <p className="text-2xl font-bold text-gray-600">{stats.hidden}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Avg Rating</p>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-gray-900">{stats.avgRating}</span>
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "All", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Approved", value: "approved" },
              { label: "Hidden", value: "hidden" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === tab.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-48"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-4 mb-4 flex items-center justify-between">
          <span className="text-indigo-700 font-medium">{selectedReviews.length} reviews selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
            >
              Approve Selected
            </button>
            <button
              onClick={() => setSelectedReviews([])}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <span className="text-5xl mb-4 block">⭐</span>
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-2 px-4">
            <input
              type="checkbox"
              checked={selectedReviews.length === reviews.length && reviews.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>

          {reviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-xl p-5 border ${
                selectedReviews.includes(review._id) ? "border-indigo-400 bg-indigo-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review._id)}
                  onChange={() => toggleSelectReview(review._id)}
                  className="w-4 h-4 mt-1 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />

                {/* User Info */}
                <div className="flex-shrink-0">
                  {review.user?.profilePicture ? (
                    <img
                      src={
                        review.user.profilePicture.startsWith("http")
                          ? review.user.profilePicture
                          : `${BACKEND_URL}/images/${review.user.profilePicture}`
                      }
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</span>
                        {getStatusBadge(review)}
                      </div>
                      <span className="text-xs text-gray-500">{review.user?.email}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
                    {review.product?.image?.[0] && (
                      <img
                        src={
                          review.product.image[0].startsWith("http")
                            ? review.product.image[0]
                            : `${BACKEND_URL}/images/${review.product.image[0]}`
                        }
                        alt={review.product?.name}
                        className="w-12 h-12 object-contain rounded"
                      />
                    )}
                    <span className="text-sm text-gray-700 font-medium">{review.product?.name}</span>
                  </div>

                  {/* Rating & Review */}
                  <div className="mb-2">{renderStars(review.rating)}</div>
                  <h5 className="font-medium text-gray-800 mb-1">{review.title}</h5>
                  <p className="text-gray-600 text-sm mb-3">{review.comment}</p>

                  {/* Admin Reply */}
                  {review.adminReply && (
                    <div className="bg-indigo-50 rounded-lg p-3 mb-3 border-l-2 border-indigo-400">
                      <p className="text-xs font-semibold text-indigo-600 mb-1">Your Reply:</p>
                      <p className="text-sm text-gray-700">{review.adminReply}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {!review.isApproved && !review.isHidden && (
                      <button
                        onClick={() => handleApprove(review._id)}
                        className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                      >
                        ✓ Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleHide(review._id)}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      {review.isHidden ? "👁 Unhide" : "🙈 Hide"}
                    </button>
                    <button
                      onClick={() => setReplyModal({ show: true, review, reply: review.adminReply || "" })}
                      className="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                    >
                      💬 {review.adminReply ? "Edit Reply" : "Reply"}
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply to Review</h3>

            {/* Review Preview */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-800">{replyModal.review?.user?.name}</span>
                {renderStars(replyModal.review?.rating)}
              </div>
              <p className="text-sm text-gray-600">{replyModal.review?.comment}</p>
            </div>

            <textarea
              value={replyModal.reply}
              onChange={(e) => setReplyModal({ ...replyModal, reply: e.target.value })}
              placeholder="Write your reply to this review..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReplyModal({ show: false, review: null, reply: "" })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {replyModal.review?.adminReply ? "Update Reply" : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
