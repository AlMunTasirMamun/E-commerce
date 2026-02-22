import Order from "../models/order.model.js";
import Transaction from "../models/transaction.model.js";
import Product from "../models/product.model.js";
import { amarpayConfig, generateSignature } from "../config/amarpay.js";
import axios from "axios";

// Create online payment for bKash, Nagad, Rocket, Cards, etc.
export const createOnlinePayment = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address, paymentMethod, phoneNumber, shippingFee = 0, isExpressDelivery = false } = req.body;

    if (!address || !items || items.length === 0) {
      return res.status(400).json({
        message: "Invalid order details",
        success: false,
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        message: "Payment method is required",
        success: false,
      });
    }

    // Calculate amount (product price only - shipping is separate)
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          success: false,
        });
      }
      amount += product.offerPrice * item.quantity;
    }

    // Add tax charge 2%
    const taxAmount = Math.floor((amount * 2) / 100);
    const totalAmount = amount + taxAmount;

    // Create order in database with payment status as paid
    // amount = product price + tax (revenue for seller)
    // shippingFee = shipping cost (stored separately, not part of revenue)
    const order = await Order.create({
      userId,
      items,
      address,
      amount: totalAmount,
      shippingFee: shippingFee, // Store shipping fee separately
      isExpressDelivery: isExpressDelivery, // Express delivery option
      paymentType: paymentMethod,
      isPaid: true,  // Mark as paid for online payments
      status: "Confirmed",  // Mark as confirmed
      paymentAccount: phoneNumber || null, // Store payment account (phone number)
    });

    // Generate unique transaction ID
    const transactionId = `TXN-${paymentMethod.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record (total includes shipping for transaction tracking)
    await Transaction.create({
      orderId: order._id,
      transactionId,
      userId,
      amount: totalAmount + shippingFee, // Total paid by customer
      paymentMethod: paymentMethod,
      status: "completed",  // Mark transaction as completed
      metadata: {
        paymentMethod: paymentMethod,
        phoneNumber: phoneNumber || null,
        processedAt: new Date(),
        shippingFee: shippingFee,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      transactionId,
      orderId: order._id,
      amount: totalAmount,
      shippingFee: shippingFee,
      paymentMethod: paymentMethod,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Create fake payment request (for testing without Amarpay credentials)
export const createFakePaymentRequest = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;

    if (!address || !items || items.length === 0) {
      return res.status(400).json({
        message: "Invalid order details",
        success: false,
      });
    }

    // Calculate amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          success: false,
        });
      }
      amount += product.offerPrice * item.quantity;
    }

    // Add tax charge 2%
    const taxAmount = Math.floor((amount * 2) / 100);
    const totalAmount = amount + taxAmount;

    // Create order in database
    const order = await Order.create({
      userId,
      items,
      address,
      amount: totalAmount,
      paymentType: "amarpay",
      isPaid: false,
    });

    // Generate unique transaction ID
    const transactionId = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    await Transaction.create({
      orderId: order._id,
      transactionId,
      userId,
      amount: totalAmount,
      status: "pending",
    });

    // Return fake payment page URL (local test page)
    const paymentUrl = `${process.env.BASE_URL || "http://localhost:5173"}/test-payment?transactionId=${transactionId}&orderId=${order._id}&amount=${totalAmount}`;

    return res.status(200).json({
      success: true,
      paymentUrl,
      transactionId,
      orderId: order._id,
      message: "Test payment ready - you can complete or fail the payment",
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Create real payment request (with Amarpay)
export const createPaymentRequest = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;

    if (!address || !items || items.length === 0) {
      return res.status(400).json({
        message: "Invalid order details",
        success: false,
      });
    }

    // Calculate amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          success: false,
        });
      }
      amount += product.offerPrice * item.quantity;
    }

    // Add tax charge 2%
    const taxAmount = Math.floor((amount * 2) / 100);
    const totalAmount = amount + taxAmount;

    // Create order in database
    const order = await Order.create({
      userId,
      items,
      address,
      amount: totalAmount,
      paymentType: "amarpay",
      isPaid: false,
    });

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    await Transaction.create({
      orderId: order._id,
      transactionId,
      userId,
      amount: totalAmount,
      status: "pending",
    });

    // Prepare Amarpay payment request data
    const paymentData = {
      store_id: amarpayConfig.storeId,
      signature_key: amarpayConfig.signatureKey,
      tran_id: transactionId,
      success_url: amarpayConfig.returnUrl,
      fail_url: amarpayConfig.failureUrl,
      cancel_url: amarpayConfig.cancellationUrl,
      amount: totalAmount.toString(),
      currency: "BDT",
      desc: `Order #${order._id}`,
      cus_name: "Customer",
      cus_email: "customer@example.com",
      cus_phone: "01700000000",
      type: "json",
    };

    // Generate signature
    const signature = generateSignature(paymentData, amarpayConfig.signatureKey);
    paymentData.signature = signature;

    // Send payment request to Amarpay
    const response = await axios.post(
      `${amarpayConfig.apiUrl}/api/v1/tokenized/payment-request/`,
      paymentData
    );

    if (response.data.response === "success") {
      return res.status(200).json({
        success: true,
        paymentUrl: response.data.payment_url,
        transactionId,
        orderId: order._id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to create payment request",
      });
    }
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

// Handle payment success callback from Amarpay
export const handlePaymentCallback = async (req, res) => {
  try {
    const { tran_id, status, amount } = req.body;

    // Find transaction
    const transaction = await Transaction.findOne({ transactionId: tran_id });
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
        success: false,
      });
    }

    // Update transaction status
    if (status === "Successful") {
      transaction.status = "completed";
      transaction.paymentGatewayResponse = req.body;

      // Update order status
      const order = await Order.findById(transaction.orderId);
      order.isPaid = true;
      order.status = "Confirmed";

      await transaction.save();
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment completed successfully",
        transactionId: tran_id,
        orderId: transaction.orderId,
      });
    } else if (status === "Failed") {
      transaction.status = "failed";
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Payment failed",
        transactionId: tran_id,
      });
    } else if (status === "Cancelled") {
      transaction.status = "cancelled";
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Payment cancelled",
        transactionId: tran_id,
      });
    }
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ transactionId }).populate("orderId");
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      transaction,
      order: transaction.orderId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Complete test payment (for fake payment testing)
export const completeTestPayment = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
        success: false,
      });
    }

    if (status === "success") {
      transaction.status = "completed";
      const order = await Order.findById(transaction.orderId);
      order.isPaid = true;
      order.status = "Confirmed";
      
      await transaction.save();
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Test payment completed successfully",
        transactionId,
      });
    } else if (status === "failed") {
      transaction.status = "failed";
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Test payment failed",
        transactionId,
      });
    }
  } catch (error) {
    console.error("Test payment error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get user's transaction history
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user;

    const transactions = await Transaction.find({ userId })
      .populate({
        path: "orderId",
        select: "items amount shippingFee status address createdAt isExpressDelivery",
        populate: {
          path: "items.product",
          select: "name image category",
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// Get single transaction details for PDF
export const getTransactionDetails = async (req, res) => {
  try {
    const userId = req.user;
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ transactionId, userId })
      .populate({
        path: "orderId",
        populate: {
          path: "items.product",
          select: "name image category offerPrice price",
        },
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Get transaction details error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
