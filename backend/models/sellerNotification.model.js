import mongoose from "mongoose";

const sellerNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["refund_request", "new_order", "low_stock", "general", "support_message", "new_review"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: ["Refund", "Order", "Product", "SupportMessage", "Review"],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const SellerNotification = mongoose.model("SellerNotification", sellerNotificationSchema);

export default SellerNotification;
