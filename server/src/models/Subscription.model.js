import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true
    },

    plan: {
      type: String,
      enum: [
        "1-month",
        "2-month",
        "6-month",
        "1-year"
      ],
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    startDate: {
      type: Date,
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: [
        "active",
        "expired",
        "cancelled",
        "pending"
      ],
      default: "pending"
    },

    features: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);