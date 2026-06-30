import { z } from "zod";

export const createLeavePolicySchema = z.object({
    body: z.object({
        leaveName: z.string().min(1, "Leave Name is required"),
        leaveCode: z.string().min(1, "Leave Code is required"),
        isPaid: z.boolean(),
        annualAllocation: z.number().min(0, "Annual allocation must be 0 or greater"),
        carryForwardAllowed: z.boolean().optional(),
        maxCarryForward: z.number().min(0).optional(),
        halfDayAllowed: z.boolean().optional(),
        requiresApproval: z.boolean().optional(),
        effectiveFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid effectiveFrom date format",
        })
    })
});

export const updateLeavePolicySchema = z.object({
    body: z.object({
        leaveName: z.string().min(1).optional(),
        isPaid: z.boolean().optional(),
        annualAllocation: z.number().min(0).optional(),
        carryForwardAllowed: z.boolean().optional(),
        maxCarryForward: z.number().min(0).optional(),
        halfDayAllowed: z.boolean().optional(),
        requiresApproval: z.boolean().optional(),
        effectiveFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid effectiveFrom date format",
        }).optional()
    })
});

export const requestLeaveSchema = z.object({
    body: z.object({
        leavePolicyId: z.string().min(1, "Leave Policy ID is required"),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid startDate date format",
        }),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid endDate date format",
        }),
        totalDays: z.number().min(0.5, "Total days must be at least 0.5"),
        halfDayInformation: z.enum(['First Half', 'Second Half', 'None']).optional(),
        reason: z.string().min(1, "Reason is required"),
        supportingDocuments: z.array(z.string()).optional()
    }).refine((data) => {
        return new Date(data.endDate) >= new Date(data.startDate);
    }, {
        message: "End date must be greater than or equal to start date",
        path: ["endDate"]
    })
});

export const approveRejectLeaveSchema = z.object({
    body: z.object({
        action: z.enum(['Approved', 'Rejected']),
        remarks: z.string().optional()
    }).refine((data) => {
        if (data.action === 'Rejected' && !data.remarks) {
            return false;
        }
        return true;
    }, {
        message: "Remarks are required when rejecting a leave",
        path: ["remarks"]
    })
});
