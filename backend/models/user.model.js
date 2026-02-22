import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    cartItems: { type: Object, default: {} },
    notifications: [
      {
        type: {
          type: String,
          enum: ["refund_approved", "refund_rejected", "order_update", "general"],
          default: "general",
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        relatedId: { type: String }, // orderId, refundId, etc.
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { minimize: false }
);

const User = mongoose.model("User", userSchema);
export default User;
