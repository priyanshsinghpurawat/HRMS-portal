import mongoose from "mongoose";

/**
 * FAQ Schema
 * Stores frequently asked questions organized by category.
 * Used by both the public FAQ page and the admin CRUD panel.
 */
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: 300,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "General",
          "Job Seekers",
          "Companies",
          "HR & Employees",
          "Account & Login",
          "Subscriptions",
        ],
        message: "Invalid FAQ category",
      },
      default: "General",
    },
    order: {
      type: Number,
      default: 0, // Controls display order within each category (lower = first)
    },
    isActive: {
      type: Boolean,
      default: true, // Set to false to hide without deleting
    },
  },
  { timestamps: true }
);

// Compound index for efficient sorted queries per category
faqSchema.index({ category: 1, order: 1 });

export const Faq = mongoose.model("Faq", faqSchema);
