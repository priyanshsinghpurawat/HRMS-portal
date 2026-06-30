import { z } from "zod";

export const schedulePayrollSchema = z.object({
    body: z.object({
        payrollMonth: z.number().min(1).max(12),
        payrollYear: z.number().min(2000).max(2100),
        scheduledDate: z.string().optional() // ISO date string for custom schedule
    })
});

export const updatePayrollStatusSchema = z.object({
    body: z.object({
        status: z.enum([
            'Draft', 'Generated', 'Under Review', 'Approved', 'Locked', 
            'Payslip Generated', 'Published', 'Salary Released', 'Completed'
        ])
    })
});

export const approvePayrollSchema = z.object({
    body: z.object({
        notes: z.string().optional()
    })
});
