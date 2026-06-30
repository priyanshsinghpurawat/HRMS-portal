import { Faq } from "../models/Faq.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── Public Endpoints ───────────────────────────────────────────────────────

/**
 * GET /api/v1/faqs
 * Public — returns all active FAQs grouped by category.
 * Used by the frontend FAQ page.
 */
export const getAllFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find({ isActive: true })
    .sort({ category: 1, order: 1, createdAt: 1 });

  // Group FAQs by category for easier frontend rendering
  const grouped = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return res
    .status(200)
    .json(new ApiResponse(200, { faqs, grouped }, "FAQs retrieved successfully"));
});

// ─── Admin Endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/v1/faqs/all
 * Admin — returns all FAQs including inactive ones.
 * Used by the admin panel to manage FAQ content.
 */
export const getAllFaqsAdmin = asyncHandler(async (req, res) => {
  const faqs = await Faq.find({})
    .sort({ category: 1, order: 1, createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, faqs, "FAQs retrieved successfully"));
});

/**
 * POST /api/v1/faqs
 * Admin — creates a new FAQ entry.
 */
export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, category, order, isActive } = req.body;

  const faq = await Faq.create({
    question,
    answer,
    category: category || "General",
    order: order ?? 0,
    isActive: isActive ?? true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, faq, "FAQ created successfully"));
});

/**
 * PUT /api/v1/faqs/:id
 * Admin — updates an existing FAQ by ID.
 */
export const updateFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const faq = await Faq.findById(id);
  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  // Apply only the fields that were provided
  Object.assign(faq, updates);
  await faq.save();

  return res
    .status(200)
    .json(new ApiResponse(200, faq, "FAQ updated successfully"));
});

/**
 * DELETE /api/v1/faqs/:id
 * Admin — permanently deletes a FAQ by ID.
 */
export const deleteFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const faq = await Faq.findById(id);
  if (!faq) {
    throw new ApiError(404, "FAQ not found");
  }

  await Faq.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "FAQ deleted successfully"));
});
