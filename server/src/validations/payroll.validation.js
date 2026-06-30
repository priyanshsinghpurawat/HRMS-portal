import { z } from "zod";

const payrollStatuses = ['Draft', 'Generated', 'Approved', 'Locked', 'Paid'];

export const generatePayrollSchema = z.object({
    body: z.object({
        employeeId: z.string().min(1, "Employee ID is required"),
        month: z.number().min(1).max(12, "Month must be between 1 and 12"),
        year: z.number().min(2000).max(2100, "Invalid year"),
        
        // Optional ad-hoc additions for this specific payroll cycle
        additionalEarnings: z.object({
            bonus: z.number().min(0).optional(),
            incentive: z.number().min(0).optional(),
            overtime: z.number().min(0).optional(),
            reimbursement: z.number().min(0).optional(),
            arrears: z.number().min(0).optional(),
            otherEarnings: z.number().min(0).optional()
        }).optional(),
        
        additionalDeductions: z.object({
            salaryAdvanceRecovery: z.number().min(0).optional(),
            loanRecovery: z.number().min(0).optional(),
            otherDeductions: z.number().min(0).optional()
        }).optional()
    })
});

export const bulkGeneratePayrollSchema = z.object({
    body: z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2000).max(2100),
        department: z.string().optional(), // Optional: if provided, filters employees by department
        employeeIds: z.array(z.string()).optional() // Optional: specific list of employees
    })
});

export const updatePayrollStatusSchema = z.object({
    body: z.object({
        status: z.enum(payrollStatuses, {
            errorMap: () => ({ message: `Status must be one of: ${payrollStatuses.join(', ')}` })
        })
    })
});
