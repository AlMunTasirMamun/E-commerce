import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// Place order COD: /api/order/place
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address, shippingFee = 0, isExpressDelivery = false } = req.body;
    if (!address || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid order details", success: false });
    }
    // calculate amount using items (product price only - shipping is separate)
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add tax charge 2%
    amount += Math.floor((amount * 2) / 100);
    
    // amount = product price + tax (revenue for seller)
    // shippingFee = shipping cost (stored separately, not part of revenue)
    await Order.create({
      userId,
      items,
      address,
      amount,
      shippingFee, // Store shipping fee separately
      isExpressDelivery, // Express delivery option
      paymentType: "COD",
      isPaid: false,
    });
    res
      .status(201)
      .json({ message: "Order placed successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// oredr details for individual user :/api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get all orders for admin :/api/order/all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update order status: /api/order/status/:orderId
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Order Placed",
      "Confirmed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid status" 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Don't allow status change for FULLY refunded or cancelled orders
    if (order.status === "Refunded" || order.status === "Cancelled") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot change status of fully refunded or cancelled orders" 
      });
    }

    // For orders with refund status, check if there are non-refunded items
    if (["Refund Requested", "Refund Approved", "Refund Rejected"].includes(order.status)) {
      const hasNonRefundedItems = order.items.some(item => 
        !item.refundStatus || item.refundStatus === "none" || item.refundStatus === "rejected"
      );
      if (!hasNonRefundedItems) {
        return res.status(400).json({ 
          success: false, 
          message: "All items are under refund - cannot update status" 
        });
      }
    }

    // Update status and set tracking dates
    const now = new Date();
    order.status = status;

    if (status === "Confirmed" && !order.confirmedAt) {
      order.confirmedAt = now;
      // Set estimated delivery (3-5 days for regular, 1-2 days for express)
      const daysToAdd = order.isExpressDelivery ? 2 : 5;
      order.estimatedDelivery = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }
    if (status === "Shipped" && !order.shippedAt) {
      order.shippedAt = now;
    }
    if (status === "Out for Delivery" && !order.outForDeliveryAt) {
      order.outForDeliveryAt = now;
    }
    if (status === "Delivered" && !order.deliveredAt) {
      order.deliveredAt = now;
    }

    await order.save();

    res.status(200).json({ 
      success: true, 
      message: "Order status updated successfully",
      order 
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
