import { z } from "zod";

const validateGrossSalary = (data) => {
    const calculatedGross = 
        (data.components.basicSalary || 0) +
        (data.components.hra || 0) +
        (data.components.specialAllowance || 0) +
        (data.components.medicalAllowance || 0) +
        (data.components.conveyanceAllowance || 0) +
        (data.components.otherAllowances || 0);
    
    return Math.abs(calculatedGross - data.grossSalary) <= 0.01;
};

const componentsSchema = z.object({
    basicSalary: z.number().min(0, "Basic Salary must be a positive number"),
    hra: z.number().min(0, "HRA must be a positive number"),
    specialAllowance: z.number().min(0, "Special Allowance must be a positive number"),
    medicalAllowance: z.number().min(0, "Medical Allowance must be a positive number"),
    conveyanceAllowance: z.number().min(0, "Conveyance Allowance must be a positive number"),
    otherAllowances: z.number().min(0, "Other Allowances must be a positive number"),
});

const statutoryDeductionsSchema = z.object({
    pfApplicable: z.boolean().optional(),
    esicApplicable: z.boolean().optional(),
    ptApplicable: z.boolean().optional(),
    tdsApplicable: z.boolean().optional()
});

export const createSalarySchema = z.object({
    body: z.object({
        salaryType: z.enum(["Monthly"]).optional(),
        components: componentsSchema,
        grossSalary: z.number().min(0, "Gross salary must be a positive number"),
        statutoryDeductions: statutoryDeductionsSchema.optional(),
        effectiveFrom: z.string({
            required_error: "Effective from date is required",
        }).refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format for effectiveFrom",
        }),
        revisionReason: z.string().optional()
    }).refine(validateGrossSalary, {
        message: "Sum of components does not match gross salary",
        path: ["grossSalary"]
    })
});

// For salary revisions, the payload structure is essentially the same as creation
export const revisionSalarySchema = createSalarySchema;
