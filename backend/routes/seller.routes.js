import express from "express";
import {
  checkAuth,
  sellerLogin,
  sellerLogout,
  getSellerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controller/seller.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
const router = express.Router();

router.post("/login", sellerLogin);
router.get("/is-auth", authSeller, checkAuth);
router.get("/logout", authSeller, sellerLogout);

// Notification routes
router.get("/notifications", authSeller, getSellerNotifications);
router.put("/notifications/read-all", authSeller, markAllNotificationsRead);
router.put("/notifications/:id/read", authSeller, markNotificationRead);
router.delete("/notifications/:id", authSeller, deleteNotification);

export default router;
