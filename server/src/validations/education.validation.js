import { z } from "zod";
import { EDUCATION_LEVELS } from "../constants/index.js";

export const addEducationSchema = z.object({
    body: z.object({
        institution: z.string().trim().min(1, "Institution is required").max(100),
        degree: z.string().trim().min(1, "Degree is required").max(100),
        fieldOfStudy: z.string().trim().min(1, "Field of study is required").max(100),
        educationLevel: z.enum(EDUCATION_LEVELS),
        startDate: z.string().datetime("Invalid start date").or(z.date()),
        endDate: z.string().datetime().or(z.date()).optional(),
        currentlyStudying: z.boolean().optional(),
        grade: z.string().trim().max(20).optional()
    }).refine(data => {
        if (!data.currentlyStudying && !data.endDate) {
            return false;
        }
        return true;
    }, {
        message: "End date is required if not currently studying",
        path: ["endDate"]
    })
});

export const updateEducationSchema = z.object({
    body: addEducationSchema.shape.body.partial()
});
