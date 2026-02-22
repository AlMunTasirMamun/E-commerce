import express from "express";
import {
  checkAuth,
  loginUser,
  logout,
  registerUser,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  changePassword,
} from "../controller/user.controller.js";
import authUser from "../middlewares/authUser.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/is-auth", authUser, checkAuth);
router.get("/logout", authUser, logout);

// Notification routes
router.get("/notifications", authUser, getNotifications);
router.put("/notifications/read-all", authUser, markAllNotificationsRead);
router.put("/notifications/:notificationId/read", authUser, markNotificationRead);

// Profile routes
router.get("/profile", authUser, getUserProfile);
router.put("/profile", authUser, updateUserProfile);
router.post("/profile/picture", authUser, upload.single("profilePicture"), uploadProfilePicture);
router.put("/change-password", authUser, changePassword);

export default router;
