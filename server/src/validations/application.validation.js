import { z } from "zod";

export const applySchema = z.object({
    body: z.object({
        coverLetter: z.string().trim().max(2000).default("").optional()
    })
});

export const updateStatusSchema = z.object({
    body: z.object({
        internalStatus: z.enum([
            "APPLIED",
            "AI_SCREENED",
            "SHORTLIST_QUEUE",
            "HOLD_QUEUE",
            "UNDER_HR_REVIEW",
            "SHORTLISTED",
            "INTERVIEW_SCHEDULED",
            "SELECTED",
            "HIRED",
            "NOT_SELECTED"
        ])
    })
});

export const updateQueueSchema = z.object({
    body: z.object({
        queueStatus: z.enum(["shortlist_queue", "hold_queue", "review_queue"])
    })
});
