import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Allow guest messages
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "resolved", "closed"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  adminReply: {
    type: String,
    default: null,
  },
  repliedAt: {
    type: Date,
    default: null,
  },
  repliedBy: {
    type: String,
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  userRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);

export default SupportMessage;
