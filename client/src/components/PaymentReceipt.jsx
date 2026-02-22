import { useRef } from "react";
import { assets } from "../assets/assets";
import { jsPDF } from "jspdf";

const PaymentReceipt = ({ isOpen, onClose, receiptData }) => {
  const receiptRef = useRef(null);

  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    const doc = generatePDF();
    // Open PDF in new window and trigger print
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, "_blank");
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34); // Green for IUBAT
    doc.text("IUBAT", pageWidth / 2 - 20, y, { align: "center" });
    doc.setTextColor(255, 140, 0); // Orange for MARKETPLACE
    doc.text("MARKETPLACE", pageWidth / 2 + 25, y, { align: "center" });
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Payment Receipt", pageWidth / 2, y, { align: "center" });
    y += 8;

    // Success badge
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(pageWidth / 2 - 30, y, 60, 10, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Payment Successful", pageWidth / 2, y + 7, { align: "center" });
    y += 20;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Transaction Details
    doc.setLineDashPattern([], 0);
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);

    const addRow = (label, value) => {
      doc.setTextColor(100, 100, 100);
      doc.text(label, 25, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text(String(value), pageWidth - 25, y, { align: "right" });
      doc.setFont(undefined, "normal");
      y += 8;
    };

    addRow("Transaction ID:", receiptData.transactionId);
    addRow("Date:", new Date(receiptData.date).toLocaleString());
    addRow("Payment Method:", receiptData.paymentMethod);
    if (receiptData.phoneNumber) {
      addRow("Phone:", "+880 " + receiptData.phoneNumber);
    }
    y += 5;

    // Items section
    if (receiptData.items && receiptData.items.length > 0) {
      doc.setFillColor(249, 249, 249);
      const itemsHeight = receiptData.items.length * 8 + 15;
      doc.roundedRect(20, y, pageWidth - 40, itemsHeight, 3, 3, "F");
      y += 8;

      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.setFont(undefined, "bold");
      doc.text("Items Purchased", 25, y);
      doc.setFont(undefined, "normal");
      y += 8;

      doc.setFontSize(10);
      receiptData.items.forEach((item) => {
        const itemName = item.product?.name || "Item";
        const itemTotal = (item.product?.offerPrice || 0) * item.quantity;
        doc.setTextColor(100, 100, 100);
        doc.text(`${itemName} x ${item.quantity}`, 28, y);
        doc.setTextColor(0, 0, 0);
        doc.text(`BDT ${itemTotal}`, pageWidth - 28, y, { align: "right" });
        y += 7;
      });
      y += 10;
    }

    // Amount Details
    doc.setFontSize(11);
    addRow("Subtotal:", "BDT " + receiptData.subtotal);
    addRow("Tax (2%):", "BDT " + receiptData.tax);

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
    doc.text("BDT " + receiptData.totalAmount, pageWidth - 25, y, { align: "right" });
    y += 15;

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([3, 3], 0);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, "normal");
    doc.text("Thank you for shopping with us!", pageWidth / 2, y, { align: "center" });
    y += 6;
    doc.setFontSize(8);
    doc.text("IUBAT Marketplace © 2026", pageWidth / 2, y, { align: "center" });

    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`receipt-${receiptData.transactionId}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Receipt Content */}
        <div ref={receiptRef} className="p-6">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
            {assets.iubat_logo ? (
              <img 
                src={assets.iubat_logo} 
                alt="IUBAT Marketplace" 
                className="h-16 w-auto mx-auto"
              />
            ) : (
              <h1 className="text-2xl font-bold">
                <span className="text-green-700">IUBAT</span>
                <span className="text-orange-500"> MARKETPLACE</span>
              </h1>
            )}
            <p className="text-gray-600 mt-2">Payment Receipt</p>
            <div className="mt-3">
              <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                ✓ Payment Successful
              </span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between py-2 border-b border-dotted border-gray-200">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-semibold text-sm">{receiptData.transactionId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dotted border-gray-200">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-semibold">{new Date(receiptData.date).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dotted border-gray-200">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold flex items-center gap-2">
                {receiptData.paymentMethodIcon && (
                  <img src={receiptData.paymentMethodIcon} alt="" className="w-5 h-5" />
                )}
                {receiptData.paymentMethod}
              </span>
            </div>
            {receiptData.phoneNumber && (
              <div className="flex justify-between py-2 border-b border-dotted border-gray-200">
                <span className="text-gray-600">Phone Number</span>
                <span className="font-semibold">+880 {receiptData.phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Items */}
          {receiptData.items && receiptData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-semibold text-gray-700 mb-2">Items Purchased</p>
              {receiptData.items.map((item, index) => (
                <div key={index} className="flex justify-between py-1 text-sm">
                  <span className="text-gray-600">
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span className="font-medium">৳{item.product?.offerPrice * item.quantity}</span>
                </div>
              ))}
            </div>
          )}

          {/* Amount Details */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">৳{receiptData.subtotal}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Tax (2%)</span>
              <span className="font-semibold">৳{receiptData.tax}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-800 mt-2">
              <span className="text-lg font-bold">Total Paid</span>
              <span className="text-lg font-bold text-green-600">৳{receiptData.totalAmount}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-dashed border-gray-300 pt-4 mt-4">
            <p className="text-gray-500 text-sm">Thank you for shopping with us!</p>
            <p className="text-gray-400 text-xs mt-1">IUBAT Marketplace © 2026</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 border-t flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 font-medium transition flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 font-medium transition flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
