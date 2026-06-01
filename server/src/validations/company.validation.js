import { z } from "zod";

export const companyProfileSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Company name is required" })
            .trim()
            .min(1, "Company name is required")
            .max(100, "Company name cannot exceed 100 characters"),
        description: z.string()
            .trim()
            .max(2000, "Description cannot exceed 2000 characters")
            .optional(),
        website: z.string()
            .trim()
            .regex(/^https?:\/\/.+/, "Invalid website URL")
            .optional()
            .or(z.literal("")),
        location: z.object({
            country: z.string().trim().optional(),
            state: z.string().trim().optional(),
            city: z.string().trim().optional(),
            address: z.string().trim().max(200, "Address cannot exceed 200 characters").optional(),
            pincode: z.string().trim().optional()
        }).optional(),
        socialLinks: z.object({
            linkedin: z.string().trim().regex(/^https?:\/\/.+/, "Invalid LinkedIn URL").optional().or(z.literal("")),
        }).optional(),
        tanId: z.string({ required_error: "TAN ID is required" })
            .trim()
            .regex(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/, "Invalid TAN ID"),
        gstId: z.string({ required_error: "GST ID is required" })
            .trim()
            .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[A-Z]{1}\d{1}$/, "Invalid GST ID")
    })
});
