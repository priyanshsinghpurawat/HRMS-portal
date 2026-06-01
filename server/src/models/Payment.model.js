import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR"
    },

    paymentFor: {
      type: String,
      enum: [
        "company-registration",
        "subscription-renewal"
      ],
      default: "company-registration"
    },

    razorpayOrderId: {
      type: String,
      required: true
    },

    razorpayPaymentId: {
      type: String,
      default: ""
    },

    razorpaySignature: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "created",
        "paid",
        "failed",
        "refunded"
      ],
      default: "created"
    },

    paidAt: Date
  },
  {
    timestamps: true
  }
);

export const Payment = mongoose.model(
  "Payment",
  paymentSchema
);