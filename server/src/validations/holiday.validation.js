import { z } from "zod";

const holidayTypes = ['National', 'Festival', 'Company', 'Regional', 'Custom'];
const holidayCategories = ['Mandatory', 'Optional'];
const recurrenceRules = ['Yearly', 'None'];

export const createHolidaySchema = z.object({
    body: z.object({
        holidayName: z.string().min(1, "Holiday Name is required").max(100),
        holidayDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid holiday date format",
        }),
        holidayType: z.enum(holidayTypes),
        holidayCategory: z.enum(holidayCategories),
        description: z.string().max(500).optional(),
        applicableLocations: z.array(z.string()).optional(),
        isRecurring: z.boolean().optional(),
        recurrenceRule: z.enum(recurrenceRules).optional()
    }).refine((data) => {
        if (data.isRecurring && data.recurrenceRule === 'None') {
            return false;
        }
        return true;
    }, {
        message: "Recurrence rule must be provided if isRecurring is true",
        path: ["recurrenceRule"]
    })
});

export const updateHolidaySchema = z.object({
    body: z.object({
        holidayName: z.string().min(1).max(100).optional(),
        holidayDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid holiday date format",
        }).optional(),
        holidayType: z.enum(holidayTypes).optional(),
        holidayCategory: z.enum(holidayCategories).optional(),
        description: z.string().max(500).optional(),
        applicableLocations: z.array(z.string()).optional(),
        isRecurring: z.boolean().optional(),
        recurrenceRule: z.enum(recurrenceRules).optional()
    }).refine((data) => {
        if (data.isRecurring && data.recurrenceRule === 'None') {
            return false;
        }
        return true;
    }, {
        message: "Recurrence rule must be provided if isRecurring is true",
        path: ["recurrenceRule"]
    })
});
