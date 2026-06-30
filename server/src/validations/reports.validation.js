import { z } from "zod";

export const getReportsSchema = z.object({
    query: z.object({
        month: z.string().optional().refine(val => !val || (parseInt(val) >= 1 && parseInt(val) <= 12), {
            message: "Month must be between 1 and 12"
        }),
        year: z.string().optional().refine(val => !val || (parseInt(val) >= 2000 && parseInt(val) <= 2100), {
            message: "Invalid year"
        }),
        employeeId: z.string().optional(),
        department: z.string().optional(),
        payrollStatus: z.string().optional(),
        salaryRange: z.string().optional(), // Expected format "min-max", e.g., "50000-100000"
        exportType: z.enum(['csv', 'xlsx', 'pdf']).optional()
    })
});
