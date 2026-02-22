import express from "express";
import authUser from "../middlewares/authUser.js";
import { authSeller } from "../middlewares/authSeller.js";
import {
  requestRefund,
  getUserRefunds,
  getAllRefunds,
  processRefund,
  getRefundDetails,
  cancelRefund,
} from "../controller/refund.controller.js";

const router = express.Router();

// User routes
router.post("/request", authUser, requestRefund);
router.get("/user", authUser, getUserRefunds);
router.get("/:refundId", authUser, getRefundDetails);
router.delete("/cancel/:refundId", authUser, cancelRefund);

// Seller/Admin routes
router.get("/seller/all", authSeller, getAllRefunds);
router.put("/process/:refundId", authSeller, processRefund);

export default router;
