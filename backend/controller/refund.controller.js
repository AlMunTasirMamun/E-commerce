import Refund from "../models/refund.model.js";
import Order from "../models/order.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import SellerNotification from "../models/sellerNotification.model.js";

// Calculate refund amount based on time elapsed since order
// Tax (2%) is NOT refundable - refund only applies to product price
const calculateRefundAmount = (itemsTotal, orderCreatedAt) => {
  const now = new Date();
  const orderDate = new Date(orderCreatedAt);
  const hoursElapsed = (now - orderDate) / (1000 * 60 * 60);

  // itemsTotal is already the product price (without tax for selected items)
  const productPrice = itemsTotal;
  // Calculate proportional tax (2% of product price)
  const taxAmount = Math.round(productPrice * 0.02);

  let deductionPercentage = 0;
  let deductionReason = "";

  if (hoursElapsed <= 1) {
    deductionPercentage = 0;
    deductionReason = "Cancelled within 1 hour - Full product price refund (Tax non-refundable)";
  } else if (hoursElapsed <= 6) {
    deductionPercentage = 5;
    deductionReason = "Cancelled within 6 hours - 5% processing fee (Tax non-refundable)";
  } else if (hoursElapsed <= 24) {
    deductionPercentage = 10;
    deductionReason = "Cancelled within 24 hours - 10% processing fee (Tax non-refundable)";
  } else if (hoursElapsed <= 48) {
    deductionPercentage = 15;
    deductionReason = "Cancelled within 48 hours - 15% processing fee (Tax non-refundable)";
  } else if (hoursElapsed <= 72) {
    deductionPercentage = 20;
    deductionReason = "Cancelled within 3 days - 20% processing fee (Tax non-refundable)";
  } else if (hoursElapsed <= 168) {
    deductionPercentage = 30;
    deductionReason = "Cancelled within 7 days - 30% processing fee (Tax non-refundable)";
  } else {
    deductionPercentage = 100;
    deductionReason = "Refund window expired - Refunds not accepted after 7 days";
  }

  const deductionAmount = Math.round((productPrice * deductionPercentage) / 100);
  const refundableAmount = productPrice - deductionAmount;

  return {
    originalAmount: productPrice + taxAmount,
    productPrice,
    taxAmount,
    deductionPercentage,
    deductionAmount,
    refundableAmount,
    deductionReason,
  };
};

// Request a refund: POST /api/refund/request
export const requestRefund = async (req, res) => {
  try {
    const userId = req.user;
    const { orderId, reason, description, items: selectedItems } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({
        message: "Order ID and reason are required",
        success: false,
      });
    }

    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({
        message: "Please select at least one item to refund",
        success: false,
      });
    }

    // Find the order with populated items
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    // Check if the order belongs to the user
    if (order.userId !== userId) {
      return res.status(403).json({
        message: "You are not authorized to request a refund for this order",
        success: false,
      });
    }

    // Check if order is eligible for refund (must be paid)
    if (!order.isPaid && order.paymentType !== "COD") {
      return res.status(400).json({
        message: "Only paid orders are eligible for refund",
        success: false,
      });
    }

    // Check if order status allows refund
    const nonRefundableStatuses = ["Refunded", "Cancelled"];
    if (nonRefundableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: `Orders with status "${order.status}" cannot be refunded`,
        success: false,
      });
    }

    // Check if order is within 7 days refund window
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysSinceOrder = (now - orderDate) / (1000 * 60 * 60 * 24);
    if (daysSinceOrder > 7) {
      return res.status(400).json({
        message: "Refund window has expired. Refund requests are only accepted within 7 days of order placement.",
        success: false,
      });
    }

    // Validate selected items exist in order and check for existing refunds
    const refundItems = [];
    let itemsTotal = 0;

    for (const selectedItem of selectedItems) {
      const { productId, quantity } = selectedItem;
      
      // Find the item in the order
      const orderItem = order.items.find(
        item => item.product._id.toString() === productId
      );

      if (!orderItem) {
        return res.status(400).json({
          message: `Product ${productId} not found in this order`,
          success: false,
        });
      }

      // Check if requested quantity is valid
      const requestedQty = quantity || orderItem.quantity;
      if (requestedQty > orderItem.quantity || requestedQty < 1) {
        return res.status(400).json({
          message: `Invalid quantity for product ${orderItem.product.name}`,
          success: false,
        });
      }

      // Check if this specific item already has a pending/approved refund
      const existingItemRefund = await Refund.findOne({
        orderId,
        status: { $in: ["pending", "approved"] },
        "items.productId": productId,
      });

      if (existingItemRefund) {
        return res.status(400).json({
          message: `A refund request already exists for "${orderItem.product.name}"`,
          success: false,
        });
      }

      const itemPrice = orderItem.product.offerPrice || orderItem.product.price;
      const itemTotal = itemPrice * requestedQty;
      itemsTotal += itemTotal;

      refundItems.push({
        productId: orderItem.product._id,
        productName: orderItem.product.name,
        quantity: requestedQty,
        price: itemPrice,
        totalPrice: itemTotal,
      });
    }

    // Find associated transaction if exists
    const transaction = await Transaction.findOne({ orderId });

    // Calculate refund amount based on time (using selected items total)
    const refundCalculation = calculateRefundAmount(itemsTotal, order.createdAt);

    // Create refund request with calculated amounts and items
    const refund = await Refund.create({
      orderId,
      userId,
      transactionId: transaction?.transactionId || null,
      items: refundItems,
      originalAmount: refundCalculation.originalAmount,
      productPrice: refundCalculation.productPrice,
      taxAmount: refundCalculation.taxAmount,
      refundableAmount: refundCalculation.refundableAmount,
      deductionPercentage: refundCalculation.deductionPercentage,
      deductionAmount: refundCalculation.deductionAmount,
      deductionReason: refundCalculation.deductionReason,
      originalPaymentMethod: order.paymentType,
      originalPaymentAccount: order.paymentAccount || null,
      amount: refundCalculation.refundableAmount,
      reason,
      description: description || "",
      status: "pending",
    });

    // Check if this is a partial refund (not all items being refunded)
    const isPartialRefund = refundItems.length < order.items.length;

    // Update item refund statuses in order
    for (const refundItem of refundItems) {
      const orderItemIndex = order.items.findIndex(
        item => item.product._id.toString() === refundItem.productId.toString()
      );
      if (orderItemIndex !== -1) {
        order.items[orderItemIndex].refundStatus = "pending";
      }
    }

    // Update order status
    order.status = "Refund Requested";
    order.hasPartialRefund = isPartialRefund;
    await order.save();

    // Get user details for notification
    const user = await User.findById(userId);
    const customerName = user?.name || "A customer";

    // Build item names for notification
    const itemNames = refundItems.map(i => i.productName).join(", ");

    // Create notification for seller/admin
    await SellerNotification.create({
      type: "refund_request",
      title: "New Refund Request",
      message: `${customerName} has requested a refund of ৳${refundCalculation.refundableAmount} for ${refundItems.length} item(s): ${itemNames.substring(0, 50)}${itemNames.length > 50 ? "..." : ""}`,
      relatedId: refund._id,
      relatedModel: "Refund",
      metadata: {
        orderId: orderId,
        refundId: refund._id,
        amount: refundCalculation.refundableAmount,
        reason: reason,
        customerName: customerName,
        itemCount: refundItems.length,
      },
    });

    res.status(201).json({
      success: true,
      message: "Refund request submitted successfully",
      refund,
      refundDetails: {
        originalAmount: refundCalculation.originalAmount,
        productPrice: refundCalculation.productPrice,
        taxAmount: refundCalculation.taxAmount,
        deductionPercentage: refundCalculation.deductionPercentage,
        deductionAmount: refundCalculation.deductionAmount,
        refundableAmount: refundCalculation.refundableAmount,
        deductionReason: refundCalculation.deductionReason,
        items: refundItems,
        refundTo: order.paymentAccount 
          ? `${order.paymentType} - ${order.paymentAccount.slice(0, 3)}****${order.paymentAccount.slice(-3)}`
          : order.paymentType,
      },
    });
  } catch (error) {
    console.error("Refund request error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get user's refund requests: GET /api/refund/user
export const getUserRefunds = async (req, res) => {
  try {
    const userId = req.user;

    const refunds = await Refund.find({ userId })
      .populate({
        path: "orderId",
        populate: {
          path: "items.product",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error("Get user refunds error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get all refund requests (for seller/admin): GET /api/refund/all
export const getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate({
        path: "orderId",
        populate: [
          { path: "items.product" },
          { path: "address" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      refunds,
    });
  } catch (error) {
    console.error("Get all refunds error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Process refund (approve/reject): PUT /api/refund/process/:refundId
export const processRefund = async (req, res) => {
  try {
    const { refundId } = req.params;
    const { action, adminNotes, refundMethod } = req.body;
    const sellerId = req.seller;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action. Must be 'approve' or 'reject'",
        success: false,
      });
    }

    const refund = await Refund.findById(refundId);
    if (!refund) {
      return res.status(404).json({
        message: "Refund request not found",
        success: false,
      });
    }

    if (refund.status !== "pending") {
      return res.status(400).json({
        message: "This refund has already been processed",
        success: false,
      });
    }

    const order = await Order.findById(refund.orderId);
    if (!order) {
      return res.status(404).json({
        message: "Associated order not found",
        success: false,
      });
    }

    if (action === "approve") {
      refund.status = "approved";
      refund.refundMethod = refundMethod || "original_payment";

      // For immediate refund completion (in production, this might involve payment gateway)
      refund.status = "completed";
      refund.processedAt = new Date();

      // Update item refund statuses
      for (const refundItem of refund.items) {
        const orderItemIndex = order.items.findIndex(
          item => item.product.toString() === refundItem.productId.toString()
        );
        if (orderItemIndex !== -1) {
          order.items[orderItemIndex].refundStatus = "refunded";
        }
      }

      // Check if this is a partial refund
      const nonRefundedItems = order.items.filter(item => item.refundStatus === "none");
      
      if (nonRefundedItems.length > 0) {
        // Partial refund - keep order active for remaining items
        // Revert to previous status or keep it at a reasonable state
        order.status = order.confirmedAt ? "Confirmed" : "Order Placed";
        order.hasPartialRefund = true;
      } else {
        // Full refund - all items refunded
        order.status = "Refunded";
        order.hasPartialRefund = false;
      }

      // If there's a transaction, update it
      if (refund.transactionId) {
        const transaction = await Transaction.findOne({
          transactionId: refund.transactionId,
        });
        if (transaction) {
          transaction.status = "refunded";
          transaction.metadata = {
            ...transaction.metadata,
            refundedAt: new Date(),
            refundId: refund._id,
          };
          await transaction.save();
        }
      }
    } else {
      refund.status = "rejected";
      
      // Update item refund statuses to rejected
      for (const refundItem of refund.items) {
        const orderItemIndex = order.items.findIndex(
          item => item.product.toString() === refundItem.productId.toString()
        );
        if (orderItemIndex !== -1) {
          order.items[orderItemIndex].refundStatus = "rejected";
        }
      }

      // Check if there are any non-refund-related items
      const nonRefundedItems = order.items.filter(item => item.refundStatus === "none" || item.refundStatus === "rejected");
      
      if (nonRefundedItems.length === order.items.length) {
        // All items available - revert to normal status
        order.status = order.confirmedAt ? "Confirmed" : "Order Placed";
        order.hasPartialRefund = false;
      } else {
        // Some items still under refund somewhere
        order.status = "Refund Rejected";
      }
    }

    refund.adminNotes = adminNotes || "";
    refund.processedBy = sellerId;
    refund.processedAt = new Date();

    await refund.save();
    await order.save();

    // Add notification to user with refund details
    const notificationType = action === "approve" ? "refund_approved" : "refund_rejected";
    const notificationTitle = action === "approve" 
      ? "Refund Approved!" 
      : "Refund Rejected";
    
    // Build detailed message for approved refunds
    let notificationMessage;
    if (action === "approve") {
      const refundAccountInfo = refund.originalPaymentAccount 
        ? `${refund.originalPaymentMethod} (${refund.originalPaymentAccount.slice(0, 3)}****${refund.originalPaymentAccount.slice(-3)})`
        : refund.originalPaymentMethod || "original payment method";
      
      notificationMessage = `Your refund of ৳${refund.refundableAmount} has been approved!\n` +
        `Order Total: ৳${refund.originalAmount}\n` +
        `Product Price: ৳${refund.productPrice}\n` +
        `Tax (Non-refundable): -৳${refund.taxAmount}\n` +
        (refund.deductionPercentage > 0 ? `Processing Fee (${refund.deductionPercentage}%): -৳${refund.deductionAmount}\n` : '') +
        `Refund Amount: ৳${refund.refundableAmount}\n` +
        `Refund To: ${refundAccountInfo}`;
    } else {
      notificationMessage = `Your refund request of ৳${refund.refundableAmount || refund.amount} has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ""}`;
    }

    await User.findByIdAndUpdate(refund.userId, {
      $push: {
        notifications: {
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          relatedId: refund._id.toString(),
          createdAt: new Date(),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Refund ${action === "approve" ? "approved" : "rejected"} successfully`,
      refund,
    });
  } catch (error) {
    console.error("Process refund error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get single refund details: GET /api/refund/:refundId
export const getRefundDetails = async (req, res) => {
  try {
    const { refundId } = req.params;

    const refund = await Refund.findById(refundId).populate({
      path: "orderId",
      populate: [
        { path: "items.product" },
        { path: "address" },
      ],
    });

    if (!refund) {
      return res.status(404).json({
        message: "Refund not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      refund,
    });
  } catch (error) {
    console.error("Get refund details error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Cancel refund request: DELETE /api/refund/cancel/:refundId
export const cancelRefund = async (req, res) => {
  try {
    const { refundId } = req.params;
    const userId = req.user;

    const refund = await Refund.findById(refundId);
    if (!refund) {
      return res.status(404).json({
        message: "Refund request not found",
        success: false,
      });
    }

    if (refund.userId !== userId) {
      return res.status(403).json({
        message: "You are not authorized to cancel this refund request",
        success: false,
      });
    }

    if (refund.status !== "pending") {
      return res.status(400).json({
        message: "Only pending refund requests can be cancelled",
        success: false,
      });
    }

    // Update order status back
    const order = await Order.findById(refund.orderId);
    if (order) {
      order.status = order.isPaid ? "Confirmed" : "Order Placed";
      await order.save();
    }

    await Refund.findByIdAndDelete(refundId);

    res.status(200).json({
      success: true,
      message: "Refund request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel refund error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
