import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: "User" },
    items: [
      {
        product: { type: String, required: true, ref: "Product" },
        quantity: { type: Number, required: true },
        refundStatus: { type: String, enum: ["none", "pending", "approved", "refunded", "rejected"], default: "none" },
      },
    ],
    amount: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    isExpressDelivery: { type: Boolean, default: false },
    address: { type: String, required: true, ref: "Address" },
    status: { type: String, default: "Order Placed" },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    paymentAccount: { type: String },
    // Tracking dates
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    estimatedDelivery: { type: Date },
    // Partial refund tracking
    hasPartialRefund: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;
