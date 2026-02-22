import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, user } = useContext(AppContext);

  const reasonLabels = {
    defective_product: "Defective Product",
    wrong_item: "Wrong Item Received",
    not_as_described: "Not As Described",
    damaged_in_shipping: "Damaged in Shipping",
    changed_mind: "Changed Mind",
    late_delivery: "Late Delivery",
    other: "Other",
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-blue-100 text-blue-800 border-blue-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    completed: "bg-green-100 text-green-800 border-green-200",
  };

  const statusIcons = {
    pending: "⏳",
    approved: "✓",
    rejected: "✗",
    completed: "✓✓",
  };

  const fetchRefunds = async () => {
    try {
      const { data } = await axios.get("/api/refund/user");
      if (data.success) {
        // Sort refunds - pending (under review) at top, then by date
        const sortedRefunds = (data.refunds || []).sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (a.status !== "pending" && b.status === "pending") return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setRefunds(sortedRefunds);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch refunds");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRefund = async (refundId) => {
    if (!confirm("Are you sure you want to cancel this refund request?")) {
      return;
    }

    try {
      const { data } = await axios.delete(`/api/refund/cancel/${refundId}`);
      if (data.success) {
        toast.success("Refund request cancelled successfully");
        fetchRefunds();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel refund");
    }
  };

  useEffect(() => {
    if (user) {
      fetchRefunds();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="mt-12 pb-16 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium">My Refund Requests</h1>
        <p className="text-gray-500 mt-2">Track the status of your refund requests</p>
      </div>

      {refunds.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-700">No Refund Requests</h3>
          <p className="text-gray-500 mt-2">
            You haven't requested any refunds yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {refunds.map((refund) => (
            <div
              key={refund._id}
              className={`border rounded-lg p-5 ${statusColors[refund.status]}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Refund Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{statusIcons[refund.status]}</span>
                    <span className="font-semibold text-lg capitalize">
                      {refund.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">Refund ID:</span> {refund._id}
                    </p>
                    
                    {/* Refund Amount Breakdown */}
                    <div className="mt-2 p-3 bg-white/70 rounded-lg space-y-1">
                      <p>
                        <span className="font-medium">Order Total:</span> ৳{refund.originalAmount || refund.amount}
                      </p>
                      <p className="text-gray-600 pl-2">
                        <span className="font-medium">Product Price:</span> ৳{refund.productPrice || Math.round((refund.originalAmount || refund.amount) / 1.02)}
                      </p>
                      <p className="text-red-500 pl-2">
                        <span className="font-medium">Tax (Non-refundable):</span> -৳{refund.taxAmount || (refund.originalAmount || refund.amount) - Math.round((refund.originalAmount || refund.amount) / 1.02)}
                      </p>
                      {refund.deductionPercentage > 0 && (
                        <p className="text-red-600">
                          <span className="font-medium">Processing Fee ({refund.deductionPercentage}%):</span> -৳{refund.deductionAmount || 0}
                        </p>
                      )}
                      <p className="text-green-700 font-semibold pt-1 border-t border-gray-300">
                        <span className="font-medium">Refund Amount:</span> ৳{refund.refundableAmount || refund.amount}
                      </p>
                      {refund.deductionReason && (
                        <p className="text-xs text-gray-600 italic">
                          {refund.deductionReason}
                        </p>
                      )}
                    </div>

                    {/* Refund To Account */}
                    {refund.originalPaymentMethod && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-blue-800">
                          <span className="font-medium">Refund To:</span>{" "}
                          {refund.originalPaymentAccount 
                            ? `${refund.originalPaymentMethod} - ${refund.originalPaymentAccount.slice(0, 3)}****${refund.originalPaymentAccount.slice(-3)}`
                            : refund.originalPaymentMethod}
                        </p>
                      </div>
                    )}

                    {/* Refunded Items */}
                    {refund.items && refund.items.length > 0 && (
                      <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-red-800 font-medium mb-2">Items Being Refunded:</p>
                        <div className="space-y-1">
                          {refund.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.productName} (Qty: {item.quantity})</span>
                              <span className="font-medium">৳{item.totalPrice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p>
                      <span className="font-medium">Reason:</span>{" "}
                      {reasonLabels[refund.reason] || refund.reason}
                    </p>
                    <p>
                      <span className="font-medium">Requested:</span>{" "}
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </p>
                    {refund.processedAt && (
                      <p>
                        <span className="font-medium">Processed:</span>{" "}
                        {new Date(refund.processedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {refund.description && (
                    <div className="mt-3 p-2 bg-white/50 rounded">
                      <p className="text-sm">
                        <span className="font-medium">Your Note:</span>{" "}
                        {refund.description}
                      </p>
                    </div>
                  )}

                  {refund.adminNotes && (
                    <div className="mt-3 p-2 bg-white/50 rounded">
                      <p className="text-sm">
                        <span className="font-medium">Admin Response:</span>{" "}
                        {refund.adminNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Preview */}
                {refund.orderId && (
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Order Items:</p>
                    <div className="space-y-2">
                      {refund.orderId.items?.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white/50 p-2 rounded"
                        >
                          {item.product?.image?.[0] && (
                            <img
                              src={`http://localhost:5000/images/${item.product.image[0]}`}
                              alt={item.product?.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {item.product?.name}
                            </p>
                            <p className="text-xs opacity-75">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      {refund.orderId.items?.length > 2 && (
                        <p className="text-xs opacity-75">
                          +{refund.orderId.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancel Button (only for pending) */}
                {refund.status === "pending" && (
                  <div>
                    <button
                      onClick={() => handleCancelRefund(refund._id)}
                      className="px-4 py-2 text-sm border border-current rounded-md hover:bg-white/50 transition-colors"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="mt-4 pt-4 border-t border-current/20">
                {refund.status === "pending" && (
                  <p className="text-sm">
                    Your refund request is being reviewed. We'll notify you once a decision is made.
                  </p>
                )}
                {refund.status === "approved" && (
                  <p className="text-sm">
                    Your refund has been approved and is being processed.
                  </p>
                )}
                {refund.status === "completed" && (
                  <p className="text-sm">
                    Your refund of ৳{refund.refundableAmount || refund.amount} has been processed successfully
                    {refund.originalPaymentAccount 
                      ? ` and credited to your ${refund.originalPaymentMethod} account (${refund.originalPaymentAccount.slice(0, 3)}****${refund.originalPaymentAccount.slice(-3)}).`
                      : refund.originalPaymentMethod 
                        ? ` to your ${refund.originalPaymentMethod}.`
                        : "."}
                  </p>
                )}
                {refund.status === "rejected" && (
                  <p className="text-sm">
                    Unfortunately, your refund request was not approved. Please contact support for more information.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRefunds;
