import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    transactionId: { type: String, unique: true, required: true },
    userId: { type: String, required: true, ref: "User" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "BDT" },
    paymentMethod: { type: String, default: "amarpay" },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    paymentGatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
