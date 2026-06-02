import { z } from "zod";
import { EXPERIENCE_LEVELS } from "../constants/index.js";

const experienceBaseValidationSchema = z.object({

    company: z
        .string({
            required_error:
                "Company name is required"
        })
        .trim()
        .min(
            1,
            "Company name is required"
        )
        .max(
            100,
            "Company name cannot exceed 100 characters"
        ),

    title: z
        .string({
            required_error:
                "Job title is required"
        })
        .trim()
        .min(
            1,
            "Job title is required"
        )
        .max(
            100,
            "Job title cannot exceed 100 characters"
        ),

    experienceLevel: z
        .enum(EXPERIENCE_LEVELS, {
            errorMap: () => ({
                message:
                    "Invalid experience level"
            })
        }),

    startDate: z.coerce.date({
        required_error:
            "Start date is required",
        invalid_type_error:
            "Invalid start date"
    }),

    endDate: z
        .coerce
        .date({
            invalid_type_error:
                "Invalid end date"
        })
        .nullable()
        .optional(),

    currentlyWorking: z
        .coerce
        .boolean()
        .optional()
        .default(false),

    description: z
        .string()
        .trim()
        .max(
            1000,
            "Description cannot exceed 1000 characters"
        )
        .optional()
        .or(z.literal(""))
});

/**
 * Create Experience Validation
 */
export const experienceValidationSchema =
    experienceBaseValidationSchema.refine(
        (data) => {

            if (
                data.endDate &&
                data.startDate >
                    data.endDate
            ) {
                return false;
            }

            return true;
        },
        {
            message:
                "End date cannot be before start date",
            path: ["endDate"]
        }
    );

/**
 * Update Experience Validation
 */
export const updateExperienceValidationSchema =
    experienceBaseValidationSchema.partial();