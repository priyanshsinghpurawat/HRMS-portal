import { z } from "zod";

export const blockSchema = z.object({
    body: z.object({
        reason: z.string().trim().min(3, "Block reason must be at least 3 characters").max(500, "Block reason cannot exceed 500 characters")
    })
});
