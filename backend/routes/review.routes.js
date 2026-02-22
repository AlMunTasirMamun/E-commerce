import express from "express";
import authUser from "../middlewares/authUser.js";
import { authSeller } from "../middlewares/authSeller.js";
import {
  createReview,
  getProductReviews,
  canUserReview,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  toggleHideReview,
  replyToReview,
  adminDeleteReview,
  bulkApproveReviews,
} from "../controller/review.controller.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// User routes (requires authentication)
router.post("/create", authUser, createReview);
router.get("/can-review/:productId", authUser, canUserReview);
router.put("/update/:reviewId", authUser, updateReview);
router.delete("/delete/:reviewId", authUser, deleteReview);

// Admin/Seller routes
router.get("/admin/all", authSeller, getAllReviews);
router.put("/admin/approve/:reviewId", authSeller, approveReview);
router.put("/admin/toggle-hide/:reviewId", authSeller, toggleHideReview);
router.put("/admin/reply/:reviewId", authSeller, replyToReview);
router.delete("/admin/delete/:reviewId", authSeller, adminDeleteReview);
router.put("/admin/bulk-approve", authSeller, bulkApproveReviews);

export default router;
