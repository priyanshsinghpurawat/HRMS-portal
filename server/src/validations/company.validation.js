import { z } from "zod";
import { USER_ROLES } from "../constants/index.js";

export const companySchemaValidation = z.object({
    email: z
        .string()
        .lowercase()
        .email()
        .trim(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(12, "Password too long")
        .trim(),
    role: z
        .enum(Object.values(USER_ROLES))
        .optional()
        .default(USER_ROLES.COMPANY),
    name: z
        .string()
        .trim()
        .min(1, "Company name is required")
        .max(100, "Company name cannot exceed 100 characters"),
    tanId: z
        .string()
        .trim()
        .regex(
            /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/,
            "Invalid TAN ID"
        ),
    gstId: z
        .string()
        .trim()
        .regex(
            /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[A-Z]{1}\d{1}$/,
            "Invalid GST ID"
        )
});

export const companyLoginSchema = z.object({
    body: z.object({
        email: z
            .string()
            .trim()
            .lowercase()
            .email("Invalid email address"),
        password: z
            .string()
            .min(1, "Password is required")
            .trim()
    })
});

export const createHRSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(3, "Name must be at least 3 characters")
            .max(64, "Name cannot exceed 64 characters"),
        personalEmail: z
            .string()
            .trim()
            .toLowerCase()
            .email("Invalid email format"),
        category: z.enum([
            "technical",
            "non-technical",
            "senior-recruiter",
            "manager"
        ], {
            errorMap: () => ({ message: "Invalid category" })
        }),
        designation: z.string().trim().optional(),
        phone: z.string().trim().optional()
    })
});

export const updateHRSchema = z.object({
    body: z.object({
        personalEmail: z
            .string()
            .trim()
            .toLowerCase()
            .email("Invalid email format")
            .optional(),
        category: z.enum([
            "technical",
            "non-technical",
            "senior-recruiter",
            "manager"
        ], {
            errorMap: () => ({ message: "Invalid category" })
        }).optional(),
        designation: z.string().trim().max(100).optional(),
        phone: z.string().trim().optional()
    })
});

export const resetHRPasswordSchema = z.object({
    body: z.object({}).strict().optional()
});


export const createOrderSchema = z.object({
    body: z.object({
        plan: z.enum(["1-month", "3-month", "6-month", "1-year"], {
            errorMap: () => ({ message: "Invalid plan selected" })
        })
    })
});

export const verifyPaymentSchema = z.object({
    body: z.object({
        razorpay_order_id: z.string().trim().min(1, "Razorpay Order ID is required"),
        razorpay_payment_id: z.string().trim().min(1, "Razorpay Payment ID is required"),
        razorpay_signature: z.string().trim().min(1, "Razorpay Signature is required"),
        plan: z.enum(["1-month", "3-month", "6-month", "1-year"], {
            errorMap: () => ({ message: "Invalid plan selected" })
        })
    })
});

export const updateCompanyProfileSchema = z.object({
    body: z.object({
        description: z
            .string()
            .trim()
            .max(2000, "Description cannot exceed 2000 characters")
            .optional(),
        website: z
            .string()
            .trim()
            .regex(/^https?:\/\/.+/, "Invalid website URL")
            .optional()
            .or(z.literal("")),
        socialLinks: z.object({
            linkedin: z
                .string()
                .trim()
                .regex(/^https?:\/\/.+/, "Invalid LinkedIn URL")
                .optional()
                .or(z.literal("")),
            twitter: z
                .string()
                .trim()
                .regex(/^https?:\/\/.+/, "Invalid Twitter URL")
                .optional()
                .or(z.literal("")),
            blog: z
                .string()
                .trim()
                .regex(/^https?:\/\/.+/, "Invalid Blog URL")
                .optional()
                .or(z.literal(""))
        }).optional()
    })
});