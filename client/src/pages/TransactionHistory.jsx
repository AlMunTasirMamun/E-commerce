import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { jsPDF } from "jspdf";

const TransactionHistory = () => {
  const { axios, user, navigate } = useAppContext();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/payment/transactions");
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || txn.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "bkash":
        return "🔴";
      case "nagad":
        return "🟠";
      case "rocket":
        return "🟣";
      case "card":
        return "💳";
      default:
        return "💰";
    }
  };

  const generatePDF = (txn) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34);
    doc.text("IUBAT", pageWidth / 2 - 20, y, { align: "center" });
    doc.setTextColor(255, 140, 0);
    doc.text("MARKETPLACE", pageWidth / 2 + 25, y, { align: "center" });
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Transaction Receipt", pageWidth / 2, y, { align: "center" });
    y += 8;

    // Status badge
    const statusColor =
      txn.status === "completed" ? [16, 185, 129] : [239, 68, 68];
    doc.setFillColor(...statusColor);
    doc.roundedRect(pageWidth / 2 - 25, y, 50, 10, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(txn.status.toUpperCase(), pageWidth / 2, y + 7, {
      align: "center",
    });
    y += 20;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Transaction Details
    doc.setLineDashPattern([], 0);
    doc.setFontSize(11);

    const addRow = (label, value) => {
      doc.setTextColor(100, 100, 100);
      doc.text(label, 25, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text(String(value || "N/A"), pageWidth - 25, y, { align: "right" });
      doc.setFont(undefined, "normal");
      y += 8;
    };

    addRow("Transaction ID:", txn.transactionId);
    addRow("Date:", new Date(txn.createdAt).toLocaleString());
    addRow("Payment Method:", txn.paymentMethod?.toUpperCase());
    if (txn.metadata?.phoneNumber) {
      addRow("Phone:", "+880 " + txn.metadata.phoneNumber);
    }
    y += 5;

    // Order Details
    if (txn.orderId) {
      doc.setFillColor(249, 249, 249);
      const order = txn.orderId;
      const itemsHeight = (order.items?.length || 0) * 8 + 20;
      doc.roundedRect(20, y, pageWidth - 40, itemsHeight, 3, 3, "F");
      y += 8;

      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.setFont(undefined, "bold");
      doc.text("Order Details", 25, y);
      doc.setFont(undefined, "normal");
      y += 8;

      doc.setFontSize(10);
      if (order.items) {
        order.items.forEach((item) => {
          const itemName = item.product?.name || "Item";
          const truncatedName =
            itemName.length > 30 ? itemName.substring(0, 30) + "..." : itemName;
          doc.setTextColor(100, 100, 100);
          doc.text(`${truncatedName} x ${item.quantity}`, 28, y);
          y += 7;
        });
      }
      y += 10;
    }

    // Amount Breakdown
    const order = txn.orderId;
    const shippingFee = order?.shippingFee || txn.metadata?.shippingFee || 0;
    const productAmount = order?.amount || txn.amount - shippingFee;

    addRow("Product Total:", "BDT " + productAmount?.toLocaleString());
    if (shippingFee > 0) {
      addRow(
        order?.isExpressDelivery ? "Express Shipping:" : "Shipping Fee:",
        "BDT " + shippingFee?.toLocaleString()
      );
    }

    // Total
    y += 3;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Total Paid:", 25, y);
    doc.setTextColor(16, 185, 129);
    doc.text("BDT " + txn.amount?.toLocaleString(), pageWidth - 25, y, {
      align: "right",
    });
    y += 15;

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, "normal");
    doc.text("Thank you for shopping with us!", pageWidth / 2, y, {
      align: "center",
    });
    y += 6;
    doc.setFontSize(8);
    doc.text("IUBAT Marketplace © 2026", pageWidth / 2, y, { align: "center" });

    return doc;
  };

  const handleDownloadPDF = (txn) => {
    const doc = generatePDF(txn);
    doc.save(`receipt-${txn.transactionId}.pdf`);
  };

  const handlePrintPDF = (txn) => {
    const doc = generatePDF(txn);
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  };

  // Stats
  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "completed").length,
    totalAmount: transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="bg-indigo-100 p-2 rounded-lg">📜</span>
            Transaction History
          </h1>
          <p className="text-gray-500 mt-1">
            View and download your payment receipts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Transactions</p>
                <p className="text-xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Successful</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Spent</p>
                <p className="text-xl font-bold text-indigo-600">
                  ৳{stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search by transaction ID or payment method..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <span className="text-5xl mb-4 block">📭</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No transactions found
            </h3>
            <p className="text-gray-500">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Your transaction history will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((txn) => (
              <div
                key={txn._id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Transaction Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                      {getPaymentMethodIcon(txn.paymentMethod)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-gray-600">
                          {txn.transactionId}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(
                            txn.status
                          )}`}
                        >
                          {txn.status}
                        </span>
                        {txn.orderId?.isExpressDelivery && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            ⚡ Express
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {txn.paymentMethod?.toUpperCase()} •{" "}
                        {new Date(txn.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {txn.orderId?.items && (
                        <p className="text-xs text-gray-400">
                          {txn.orderId.items.length} item(s) •{" "}
                          {txn.orderId.items[0]?.product?.name?.substring(
                            0,
                            30
                          )}
                          {txn.orderId.items.length > 1 && "..."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        ৳{txn.amount?.toLocaleString()}
                      </p>
                      {txn.orderId?.shippingFee > 0 && (
                        <p className="text-xs text-gray-400">
                          incl. ৳{txn.orderId.shippingFee} shipping
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTransaction(txn)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="View Details"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(txn)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Download PDF"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePrintPDF(txn)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Print"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Transaction Details
                </h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Status Badge */}
              <div className="text-center mb-6">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedTransaction.status
                  )}`}
                >
                  {selectedTransaction.status === "completed" ? "✓" : "⏳"}{" "}
                  {selectedTransaction.status.toUpperCase()}
                </span>
              </div>

              {/* Transaction Info */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-sm">
                    {selectedTransaction.transactionId}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Date & Time</span>
                  <span>
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="flex items-center gap-2">
                    {getPaymentMethodIcon(selectedTransaction.paymentMethod)}
                    {selectedTransaction.paymentMethod?.toUpperCase()}
                  </span>
                </div>
                {selectedTransaction.metadata?.phoneNumber && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Phone Number</span>
                    <span>+880 {selectedTransaction.metadata.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              {selectedTransaction.orderId?.items && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Order Items
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {selectedTransaction.orderId.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-sm"
                      >
                        {item.product?.image && (
                          <img
                            src={`http://localhost:5000/images/${item.product.image[0]}`}
                            alt={item.product?.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 line-clamp-1">
                            {item.product?.name || "Item"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span>
                    ৳{selectedTransaction.orderId?.amount?.toLocaleString()}
                  </span>
                </div>
                {selectedTransaction.orderId?.shippingFee > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">
                      {selectedTransaction.orderId?.isExpressDelivery
                        ? "Express Shipping"
                        : "Shipping Fee"}
                    </span>
                    <span>
                      ৳
                      {selectedTransaction.orderId.shippingFee?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-3">
                  <span className="font-bold text-gray-800">Total Paid</span>
                  <span className="font-bold text-green-600 text-lg">
                    ৳{selectedTransaction.amount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadPDF(selectedTransaction)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => handlePrintPDF(selectedTransaction)}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
