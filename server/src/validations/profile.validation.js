import { z } from "zod";
import { EXPERIENCE_LEVELS, GENDER_ENUM } from "../constants/index.js";

export const updateProfileSchema = z.object({
    body: z.object({
        title: z.string().trim().max(80).optional(),
        about: z.string().trim().max(1000).optional(),
        gender: z.enum(GENDER_ENUM).optional(),
        languages: z.array(z.string()).optional(),
        experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
        skills: z.array(z.string()).optional(),
        location: z.object({
            country: z.string().trim().optional(),
            state: z.string().trim().optional(),
            city: z.string().trim().optional(),
            address: z.string().trim().max(200).optional(),
            pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode").optional()
        }).optional(),
        socialLinks: z.object({
            linkedin: z.string().url().optional().or(z.literal("")),
            github: z.string().url().optional().or(z.literal("")),
            portfolio: z.string().url().optional().or(z.literal("")),
            twitter: z.string().url().optional().or(z.literal("")),
            blog: z.string().url().optional().or(z.literal(""))
        }).refine(
            (data) => data.linkedin || data.github || data.portfolio || data.twitter || data.blog,
            {
                message: "At least one social link is required",
            }
        ).optional()
    })
});
