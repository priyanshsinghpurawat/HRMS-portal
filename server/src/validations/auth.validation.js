import { z } from "zod";
import { USER_ROLES } from "../constants/index.js";

export const registerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(3, "Name must be at least 3 characters").max(64, "Name cannot exceed 64 characters"),
        email: z.string().trim().toLowerCase().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters").max(12, "Password too long"),
        phone: z.string().trim().regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number (+91 followed by 10 digits)"),
        role: z.enum(Object.values(USER_ROLES)).optional()
    })
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().trim().toLowerCase().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(1, "Old password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters")
    })
});

export const googleLoginSchema = z.object({
    body: z.object({
        token: z.string().min(1, "Google ID token is required")
    })
});



