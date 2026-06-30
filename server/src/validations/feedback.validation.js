import { z } from "zod";

export const createFeedbackSchema = z.object({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(1, "Title is required")
            .max(200, "Title cannot exceed 200 characters"),
        description: z
            .string()
            .trim()
            .min(1, "Description is required"),
        rating: z
            .number({ invalid_type_error: "Rating must be a number" })
            .min(1, "Rating must be at least 1")
            .max(5, "Rating cannot exceed 5"),
        companyID: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid Company ID format")
            .optional(),
        companyId: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid Company ID format")
            .optional()
    }).refine(data => data.companyID || data.companyId, {
        message: "companyID or companyId is required",
        path: ["companyID"]
    })
});
