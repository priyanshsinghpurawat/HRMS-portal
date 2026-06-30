import { z } from "zod";

/**
 * Valid FAQ categories — must match the Faq model enum.
 */
const faqCategories = [
  "General",
  "Job Seekers",
  "Companies",
  "HR & Employees",
  "Account & Login",
  "Subscriptions",
];

/**
 * Schema for creating a new FAQ.
 * All fields required except order and isActive.
 */
export const createFaqSchema = z.object({
  body: z.object({
    question: z
      .string()
      .trim()
      .min(1, "Question is required")
      .max(300, "Question must be under 300 characters"),
    answer: z
      .string()
      .trim()
      .min(1, "Answer is required")
      .max(2000, "Answer must be under 2000 characters"),
    category: z.enum(faqCategories, {
      errorMap: () => ({
        message: `Category must be one of: ${faqCategories.join(", ")}`,
      }),
    }),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Schema for updating an existing FAQ.
 * All fields optional — only provided fields are updated.
 */
export const updateFaqSchema = z.object({
  body: z.object({
    question: z.string().trim().min(1).max(300).optional(),
    answer: z.string().trim().min(1).max(2000).optional(),
    category: z.enum(faqCategories).optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});
