import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { axios } = useContext(AppContext);

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
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
  };

  const fetchRefunds = async () => {
    try {
      const { data } = await axios.get("/api/refund/seller/all");
      if (data.success) {
        // Sort: pending first, then by date (newest first)
        const sortedRefunds = (data.refunds || []).sort((a, b) => {
          // Pending status gets priority
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (a.status !== "pending" && b.status === "pending") return 1;
          // Then sort by date (newest first)
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

  const handleProcessRefund = async (refundId, action) => {
    setProcessingId(refundId);
    try {
      const { data } = await axios.put(`/api/refund/process/${refundId}`, {
        action,
        adminNotes,
        refundMethod: "original_payment",
      });

      if (data.success) {
        toast.success(`Refund ${action === "approve" ? "approved" : "rejected"} successfully`);
        fetchRefunds();
        closeDetailsModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process refund");
    } finally {
      setProcessingId(null);
    }
  };

  const openDetailsModal = (refund) => {
    setSelectedRefund(refund);
    setAdminNotes("");
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRefund(null);
    setAdminNotes("");
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  if (loading) {
    return (
      <div className="md:p-10 p-4 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="md:p-10 p-4 space-y-4">
      <h2 className="text-lg font-medium">Refund Requests</h2>

      {refunds.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No refund requests found
        </div>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <div
              key={refund._id}
              className="bg-white border border-gray-300 rounded-lg p-5 max-w-4xl"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Refund Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[refund.status]
                      }`}
                    >
                      {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Refund ID:</strong> {refund._id}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Order ID:</strong> {refund.orderId?._id}
                  </p>
                  
                  {/* Refund Amount Breakdown */}
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>Order Total:</strong> ৳{refund.originalAmount || refund.amount}
                    </p>
                    <p className="text-sm text-gray-500 pl-2">
                      <strong>Product Price:</strong> ৳{refund.productPrice || Math.round((refund.originalAmount || refund.amount) / 1.02)}
                    </p>
                    <p className="text-sm text-red-500 pl-2">
                      <strong>Tax (Non-refundable):</strong> -৳{refund.taxAmount || (refund.originalAmount || refund.amount) - Math.round((refund.originalAmount || refund.amount) / 1.02)}
                    </p>
                    {refund.deductionPercentage > 0 && (
                      <p className="text-sm text-red-600">
                        <strong>Processing Fee ({refund.deductionPercentage}%):</strong> -৳{refund.deductionAmount || 0}
                      </p>
                    )}
                    <p className="text-sm text-green-700 font-semibold pt-1 border-t border-gray-300">
                      <strong>Refund Amount:</strong> ৳{refund.refundableAmount || refund.amount}
                    </p>
                    {refund.deductionReason && (
                      <p className="text-xs text-gray-500 italic">{refund.deductionReason}</p>
                    )}
                  </div>

                  {/* Refund To Account */}
                  {refund.originalPaymentMethod && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Refund To:</strong>{" "}
                        {refund.originalPaymentAccount 
                          ? `${refund.originalPaymentMethod} - ${refund.originalPaymentAccount.slice(0, 3)}****${refund.originalPaymentAccount.slice(-3)}`
                          : refund.originalPaymentMethod}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-1 mt-2">
                    <strong>Reason:</strong> {reasonLabels[refund.reason] || refund.reason}
                  </p>
                  {refund.description && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Description:</strong> {refund.description}
                    </p>
                  )}
                </div>

                {/* Order Items Preview */}
                {refund.orderId?.items && (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">Order Items:</p>
                    <div className="space-y-2">
                      {refund.orderId.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {item.product?.image?.[0] && (
                            <img
                              src={`http://localhost:5000/images/${item.product.image[0]}`}
                              alt={item.product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">{item.product?.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {refund.orderId.items.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{refund.orderId.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openDetailsModal(refund)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                  {refund.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleProcessRefund(refund._id, "approve")}
                        disabled={processingId === refund._id}
                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {processingId === refund._id ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleProcessRefund(refund._id, "reject")}
                        disabled={processingId === refund._id}
                        className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {processingId === refund._id ? "Processing..." : "Reject"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Admin Notes if exists */}
              {refund.adminNotes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Admin Notes:</strong> {refund.adminNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Refund Details</h3>

            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[selectedRefund.status]
                  }`}
                >
                  {selectedRefund.status.charAt(0).toUpperCase() +
                    selectedRefund.status.slice(1)}
                </span>
              </div>

              {/* Refund Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Refund ID</p>
                  <p className="font-medium">{selectedRefund._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Total</p>
                  <p className="font-medium">৳{selectedRefund.originalAmount || selectedRefund.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reason</p>
                  <p className="font-medium">
                    {reasonLabels[selectedRefund.reason] || selectedRefund.reason}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested On</p>
                  <p className="font-medium">
                    {new Date(selectedRefund.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Refund Calculation Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Refund Calculation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Total</span>
                    <span className="font-medium">৳{selectedRefund.originalAmount || selectedRefund.amount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 pl-2">
                    <span>Product Price</span>
                    <span>৳{selectedRefund.productPrice || Math.round((selectedRefund.originalAmount || selectedRefund.amount) / 1.02)}</span>
                  </div>
                  <div className="flex justify-between text-red-500 pl-2">
                    <span>Tax (Non-refundable)</span>
                    <span>-৳{selectedRefund.taxAmount || (selectedRefund.originalAmount || selectedRefund.amount) - Math.round((selectedRefund.originalAmount || selectedRefund.amount) / 1.02)}</span>
                  </div>
                  {selectedRefund.deductionPercentage > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Processing Fee ({selectedRefund.deductionPercentage}%)</span>
                      <span>-৳{selectedRefund.deductionAmount || 0}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-300 text-green-700 font-semibold">
                    <span>Refund Amount</span>
                    <span>৳{selectedRefund.refundableAmount || selectedRefund.amount}</span>
                  </div>
                  {selectedRefund.deductionReason && (
                    <p className="text-xs text-gray-500 italic mt-2">{selectedRefund.deductionReason}</p>
                  )}
                </div>
              </div>

              {/* Refund To Account */}
              {selectedRefund.originalPaymentMethod && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-2 text-blue-800">Refund Payment Details</h4>
                  <p className="text-sm text-blue-700">
                    <strong>Payment Method:</strong> {selectedRefund.originalPaymentMethod}
                  </p>
                  {selectedRefund.originalPaymentAccount && (
                    <p className="text-sm text-blue-700">
                      <strong>Account:</strong> {selectedRefund.originalPaymentAccount.slice(0, 3)}****{selectedRefund.originalPaymentAccount.slice(-3)}
                    </p>
                  )}
                </div>
              )}

              {/* Refunded Items */}
              {selectedRefund.items && selectedRefund.items.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Items Being Refunded</p>
                  <div className="border border-red-200 rounded-md p-4 bg-red-50">
                    <div className="space-y-2">
                      {selectedRefund.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-white rounded border border-red-100"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{item.productName}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ৳{item.price}
                            </p>
                          </div>
                          <span className="font-semibold text-red-600">৳{item.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedRefund.description && (
                <div>
                  <p className="text-sm text-gray-500">Customer Description</p>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">
                    {selectedRefund.description}
                  </p>
                </div>
              )}

              {/* Order Details */}
              {selectedRefund.orderId && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Order Details</p>
                  <div className="border border-gray-200 rounded-md p-4">
                    <p className="text-sm mb-2">
                      <strong>Order ID:</strong> {selectedRefund.orderId._id}
                    </p>
                    <p className="text-sm mb-2">
                      <strong>Payment Method:</strong>{" "}
                      {selectedRefund.orderId.paymentType}
                    </p>
                    <div className="space-y-2 mt-3">
                      {selectedRefund.orderId.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                        >
                          {item.product?.image?.[0] && (
                            <img
                              src={`http://localhost:5000/images/${item.product.image[0]}`}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ৳{item.product?.offerPrice}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes Input (for pending refunds) */}
              {selectedRefund.status === "pending" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="Add notes about this refund decision..."
                  />
                </div>
              )}

              {/* Existing Admin Notes */}
              {selectedRefund.adminNotes && (
                <div>
                  <p className="text-sm text-gray-500">Admin Notes</p>
                  <p className="mt-1 p-3 bg-yellow-50 rounded-md">
                    {selectedRefund.adminNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedRefund.status === "pending" && (
                <>
                  <button
                    onClick={() => handleProcessRefund(selectedRefund._id, "reject")}
                    disabled={processingId === selectedRefund._id}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {processingId === selectedRefund._id ? "Processing..." : "Reject"}
                  </button>
                  <button
                    onClick={() => handleProcessRefund(selectedRefund._id, "approve")}
                    disabled={processingId === selectedRefund._id}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {processingId === selectedRefund._id ? "Processing..." : "Approve Refund"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refunds;
