import express from "express";
import {
  createSupportMessage,
  getUserSupportMessages,
  markUserMessageRead,
  getAllSupportMessages,
  getSupportMessageById,
  replyToSupportMessage,
  updateMessageStatus,
  deleteSupportMessage,
} from "../controller/support.controller.js";
import authUser, { optionalAuthUser } from "../middlewares/authUser.js";
import { authSeller } from "../middlewares/authSeller.js";

const router = express.Router();

// User routes - create with optional auth (to capture userId if logged in)
router.post("/create", optionalAuthUser, createSupportMessage);

// User routes (requires auth)
router.get("/user/messages", authUser, getUserSupportMessages);
router.put("/user/messages/:id/read", authUser, markUserMessageRead);

// Admin routes (requires seller auth)
router.get("/admin/messages", (req, res, next) => {
  console.log("Support admin/messages route hit");
  next();
}, authSeller, getAllSupportMessages);
router.get("/admin/messages/:id", authSeller, getSupportMessageById);
router.put("/admin/messages/:id/reply", authSeller, replyToSupportMessage);
router.put("/admin/messages/:id/status", authSeller, updateMessageStatus);
router.delete("/admin/messages/:id", authSeller, deleteSupportMessage);

export default router;
