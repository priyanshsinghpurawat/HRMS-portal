import { z } from "zod";

const employmentTypeEnum = z.enum(["full-time", "part-time", "internship", "contract", "remote"]);
const experienceLevelEnum = z.enum(["fresher", "junior", "mid", "senior"]);

export const createJobSchema = z.object({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(1, "Job title is required")
            .max(100, "Job title cannot exceed 100 characters"),
        description: z
            .string()
            .min(10, "Job description must be at least 10 characters"),
        department: z
            .string()
            .trim()
            .min(1, "Department is required"),
        employmentType: employmentTypeEnum,
        experienceLevel: experienceLevelEnum,
        salaryMin: z
            .number({ invalid_type_error: "Minimum salary must be a number" })
            .min(0, "Minimum salary cannot be negative"),
        salaryMax: z
            .number({ invalid_type_error: "Maximum salary must be a number" })
            .min(0, "Maximum salary cannot be negative"),
        location: z
            .string()
            .trim()
            .min(1, "Location is required"),
        skills: z
            .array(z.string())
            .optional(),
        openings: z
            .number()
            .min(1, "At least 1 opening is required")
            .optional()
    })
});

export const updateJobSchema = z.object({
    body: z.object({
        title: z
            .string()
            .trim()
            .min(1, "Job title is required")
            .max(100, "Job title cannot exceed 100 characters")
            .optional(),
        description: z
            .string()
            .min(10, "Job description must be at least 10 characters")
            .optional(),
        department: z
            .string()
            .trim()
            .min(1, "Department is required")
            .optional(),
        employmentType: employmentTypeEnum.optional(),
        experienceLevel: experienceLevelEnum.optional(),
        salaryMin: z
            .number()
            .min(0)
            .optional(),
        salaryMax: z
            .number()
            .min(0)
            .optional(),
        location: z
            .string()
            .trim()
            .min(1, "Location is required")
            .optional(),
        skills: z
            .array(z.string())
            .optional(),
        openings: z
            .number()
            .min(1)
            .optional()
    })
});
