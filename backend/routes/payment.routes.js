import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  createPaymentRequest,
  createFakePaymentRequest,
  createOnlinePayment,
  handlePaymentCallback,
  getPaymentStatus,
  completeTestPayment,
  getUserTransactions,
  getTransactionDetails,
} from "../controller/payment.controller.js";

const router = express.Router();

// Online payment for bKash, Nagad, etc.
router.post("/create-online-payment", authUser, createOnlinePayment);

// Fake payment (for testing without Amarpay credentials)
router.post("/create-fake-payment", authUser, createFakePaymentRequest);

// Real payment (with Amarpay)
router.post("/create-payment", authUser, createPaymentRequest);

// Handle Amarpay callback
router.post("/callback", handlePaymentCallback);

// Get payment status
router.get("/status/:transactionId", authUser, getPaymentStatus);

// Complete test payment
router.post("/complete-test", completeTestPayment);

// Get user's transaction history
router.get("/transactions", authUser, getUserTransactions);

// Get single transaction details
router.get("/transaction/:transactionId", authUser, getTransactionDetails);

export default router;
