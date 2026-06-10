import { z } from "zod";

export const createOfferSchema = z.object({
    body: z.object({
        applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Application ID format"),
        designation: z.string().trim().min(1, "Designation is required").max(100),
        department: z.string().trim().min(1, "Department is required").max(100),
        annualCTC: z.number().min(0, "Annual CTC must be a positive number"),
        joiningDate: z.string().or(z.date())
    })
});
