import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    // Items being refunded (allows partial order refunds)
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: Number, // Unit price at time of order
        totalPrice: Number, // quantity * price
      },
    ],
    transactionId: {
      type: String,
      ref: "Transaction",
    },
    // Original order amount (including tax)
    originalAmount: {
      type: Number,
      required: true,
    },
    // Product price without tax
    productPrice: {
      type: Number,
      required: true,
    },
    // Tax amount (non-refundable)
    taxAmount: {
      type: Number,
      default: 0,
    },
    // Calculated refundable amount after deduction (on product price only)
    refundableAmount: {
      type: Number,
      required: true,
    },
    // Deduction percentage applied
    deductionPercentage: {
      type: Number,
      default: 0,
    },
    // Deduction amount
    deductionAmount: {
      type: Number,
      default: 0,
    },
    // Reason for deduction
    deductionReason: {
      type: String,
    },
    // Original payment method
    originalPaymentMethod: {
      type: String,
    },
    // Original payment account (phone number for mobile wallets)
    originalPaymentAccount: {
      type: String,
    },
    // Legacy field for backward compatibility
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "defective_product",
        "wrong_item",
        "not_as_described",
        "damaged_in_shipping",
        "changed_mind",
        "late_delivery",
        "other",
      ],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    adminNotes: {
      type: String,
    },
    refundMethod: {
      type: String,
      enum: ["original_payment", "store_credit", "bank_transfer"],
      default: "original_payment",
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: String,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Refund = mongoose.model("Refund", refundSchema);
export default Refund;
