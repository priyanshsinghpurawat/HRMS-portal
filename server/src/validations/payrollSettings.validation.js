import { z } from "zod";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const createPayrollSettingSchema = z.object({
    body: z.object({
        weeklyOffDays: z.array(z.enum(WEEKDAYS))
            .refine(data => new Set(data).size === data.length, {
                message: "Weekly off days cannot contain duplicates",
            })
            .optional(),
        payrollCycle: z.enum(["Monthly"]).optional(),
        salaryReleaseDay: z.number().min(1).max(31).optional(),
        salaryType: z.enum(["Monthly"]).optional(),
        defaultCurrency: z.string().optional(),
        timezone: z.string().optional(),
        financialYearStart: z.enum(MONTHS).optional(),
        isPayrollEnabled: z.boolean().optional(),
        taxConfig: z.object({
            pf: z.object({
                enabled: z.boolean().optional(),
                employeeContribution: z.number().min(0).max(100).optional(),
                employerContribution: z.number().min(0).max(100).optional()
            }).optional(),
            esic: z.object({
                enabled: z.boolean().optional(),
                employeeContribution: z.number().min(0).max(100).optional(),
                employerContribution: z.number().min(0).max(100).optional()
            }).optional(),
            pt: z.object({
                enabled: z.boolean().optional()
            }).optional(),
            tds: z.object({
                enabled: z.boolean().optional()
            }).optional()
        }).optional()
    })
});

// Since PUT/PATCH is used, we can reuse the same schema for updates if it's completely partial
export const updatePayrollSettingSchema = createPayrollSettingSchema;

export const holidaySchema = z.object({
    body: z.object({
        name: z.string({
            required_error: "Holiday name is required",
        }).min(1, "Holiday name cannot be empty"),
        date: z.string({
            required_error: "Holiday date is required",
        }).refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),
        description: z.string().optional(),
        isOptional: z.boolean().optional(),
    })
});
