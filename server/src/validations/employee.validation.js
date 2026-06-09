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
