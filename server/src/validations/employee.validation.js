import { z } from "zod";

export const updateEmployeeHRSchema = z.object({
    body: z.object({
        department: z.string().trim().max(100).optional(),
        designation: z.string().trim().max(100).optional(),
        reportingManager: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Manager Employee ID format").optional().nullable()
    })
});

export const updateEmployeeSelfSchema = z.object({
    body: z.object({
        phone: z.string().trim().min(5, "Enter a valid phone number").max(20).optional(),
        address: z.string().trim().max(500, "Address cannot exceed 500 characters").optional(),
        emergencyContact: z.string().trim().min(5, "Enter valid emergency contact details").max(100).optional()
    })
});

export const createEmployeeSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Name is required" }).trim().min(2, "Name must be at least 2 characters").max(100),
        personalEmail: z.string({ required_error: "Personal email is required" }).trim().email("Invalid email format"),
        department: z.string().trim().max(100).optional(),
        designation: z.string().trim().max(100).optional(),
        phone: z.string().trim().min(5, "Enter a valid phone number").max(20).optional(),
        reportingManager: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Manager Employee ID format").optional().nullable(),
        joiningDate: z.string().optional()
    })
});
