import { z } from "zod";

export const generatePayslipSchema = z.object({
    body: z.object({
        payrollId: z.string().min(1, "Payroll ID is required")
    })
});

export const publishPayslipSchema = z.object({
    body: z.object({
        payrollId: z.string().min(1, "Payroll ID is required")
    })
});
