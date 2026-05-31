import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SalesReport = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { axios } = useContext(AppContext);

  const fetchOrders = async () => {
    if (!axios) return;
    setLoading(true);
    try {
      const { data } = await axios.get("/api/order/seller");
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by date range
  const getFilteredOrders = () => {
    return orders.filter((order) => {
      if (!order?.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      const today = new Date();

      if (dateRange === "today") {
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return orderDate >= startOfDay;
      } else if (dateRange === "week") {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return orderDate >= weekStart;
      } else if (dateRange === "month") {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return orderDate >= monthStart;
      } else if (dateRange === "year") {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return orderDate >= yearStart;
      } else if (dateRange === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return orderDate >= start && orderDate <= end;
      }
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // Calculate analytics
  const analytics = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
    totalItems: filteredOrders.reduce((sum, o) => sum + (o.items?.reduce((s, item) => s + (item.quantity || 0), 0) || 0), 0),
    paidOrders: filteredOrders.filter((o) => o.isPaid).length,
    pendingOrders: filteredOrders.filter((o) => !o.isPaid).length,
    averageOrderValue: filteredOrders.length ? (filteredOrders.reduce((sum, o) => sum + (o.amount || 0), 0) / filteredOrders.length).toFixed(2) : 0,
  };

  // Status breakdown
  const statusBreakdown = {
    confirmed: filteredOrders.filter((o) => o.status === "Confirmed").length,
    shipped: filteredOrders.filter((o) => o.status === "Shipped").length,
    delivered: filteredOrders.filter((o) => o.status === "Delivered").length,
    refunded: filteredOrders.filter((o) => o.status === "Refunded").length,
  };

  // Daily revenue data for simple chart
  const getDailyData = () => {
    const dailyData = {};
    filteredOrders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dailyData[date]) {
        dailyData[date] = { orders: 0, revenue: 0 };
      }
      dailyData[date].orders += 1;
      dailyData[date].revenue += order.amount || 0;
    });
    return Object.entries(dailyData)
      .slice(-7)
      .map(([date, data]) => ({ date, ...data }));
  };

  const dailyData = getDailyData();

  // Get max values for scaling
  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 1);

  const downloadPDF = () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to download");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 15;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(34, 139, 34);
      doc.text("SODAI", pageWidth / 2, yPosition, { align: "center" });

      yPosition += 8;
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Sales Report", pageWidth / 2, yPosition, { align: "center" });

      // Period info
      yPosition += 10;
      doc.setFontSize(10);
      const periodLabels = {
        today: "Today",
        week: "This Week",
        month: "This Month",
        year: "This Year",
        custom: `${startDate} to ${endDate}`,
        all: "All Time",
      };
      doc.text(`Period: ${periodLabels[dateRange] || "All Time"}`, 20, yPosition);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-US")}`, pageWidth - 60, yPosition);

      yPosition += 10;

      // Analytics Summary
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
      doc.text("Analytics Summary", 20, yPosition);

      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text(`Total Orders: ${analytics.totalOrders}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Total Revenue: BDT ${analytics.totalRevenue.toLocaleString()}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Total Items Sold: ${analytics.totalItems}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Average Order Value: BDT ${analytics.averageOrderValue}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Paid Orders: ${analytics.paidOrders} | Pending: ${analytics.pendingOrders}`, 20, yPosition);

      yPosition += 10;

      // Order Details Table
      doc.setFontSize(12);
      doc.setTextColor(34, 139, 34);
      doc.text("Order Details", 20, yPosition);

      yPosition += 5;

      const tableData = filteredOrders.slice(0, 20).map((order) => {
        const firstName = order.address?.firstName || "";
        const lastName = order.address?.lastName || "";
        const customerName = (firstName + " " + lastName).trim() || "N/A";
        return [
          order._id?.slice(-8).toUpperCase() || "N/A",
          order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A",
          customerName,
          order.amount || 0,
          order.status || "N/A",
          order.isPaid ? "Paid" : "Pending",
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [["Order ID", "Date", "Customer", "Amount", "Status", "Payment"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [34, 139, 34],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50],
        },
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`© ${new Date().getFullYear()} SODAI. All rights reserved.`, pageWidth / 2, pageHeight - 10, { align: "center" });

      // Save PDF
      const fileName = `Sales_Report_${dateRange}_${new Date().getTime()}.pdf`;
      doc.save(fileName);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  useEffect(() => {
    if (axios) {
      fetchOrders();
    }
  }, [axios]);

  if (!axios) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Initializing...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <span className="bg-green-100 p-2 rounded-lg">📊</span>
          Sales Report
        </h1>
        <p className="text-gray-500">View and analyze your sales performance</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          <button
            onClick={downloadPDF}
            disabled={filteredOrders.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-green-700">{analytics.totalOrders}</p>
            </div>
            <span className="text-4xl">📦</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-700">৳{(analytics.totalRevenue / 1000).toFixed(1)}K</p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-purple-700">৳{analytics.averageOrderValue}</p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium mb-1">Total Items Sold</p>
              <p className="text-3xl font-bold text-orange-700">{analytics.totalItems}</p>
            </div>
            <span className="text-4xl">🛒</span>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-600">{statusBreakdown.confirmed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">{statusBreakdown.shipped}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{statusBreakdown.delivered}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase mb-1">Refunded</p>
          <p className="text-2xl font-bold text-red-600">{statusBreakdown.refunded}</p>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      {dailyData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Revenue Trend</h2>
          <div className="flex items-end justify-between h-40 gap-2">
            {dailyData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="relative h-32 w-full flex items-end justify-center mb-2">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t transition-all hover:from-green-600 hover:to-emerald-500 cursor-pointer group"
                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="hidden group-hover:flex absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      ৳{data.revenue}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center">{data.date}</p>
                <p className="text-xs text-gray-500">{data.orders} orders</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Status Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Status</h2>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Paid Orders</p>
            <p className="text-3xl font-bold text-green-600">{analytics.paidOrders}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.totalOrders > 0 ? ((analytics.paidOrders / analytics.totalOrders) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-700">{analytics.paidOrders}</p>
              <p className="text-xs text-gray-600">of {analytics.totalOrders}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Pending Orders</p>
            <p className="text-3xl font-bold text-orange-600">{analytics.pendingOrders}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.totalOrders > 0 ? ((analytics.pendingOrders / analytics.totalOrders) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No orders found for the selected period</p>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
