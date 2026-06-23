import { applySchema, updateStatusSchema, updateQueueSchema } from '../../../src/validations/application.validation.js';

describe('Application Validation', () => {
    describe('applySchema', () => {
        it('should validate empty body correctly (using default)', () => {
            const result = applySchema.safeParse({ body: {} });
            expect(result.success).toBe(true);
            expect(result.data.body.coverLetter).toBe("");
        });

        it('should validate body with cover letter', () => {
            const result = applySchema.safeParse({ body: { coverLetter: "This is my cover letter" } });
            expect(result.success).toBe(true);
        });

        it('should fail if cover letter is too long', () => {
            const longText = "a".repeat(2001);
            const result = applySchema.safeParse({ body: { coverLetter: longText } });
            expect(result.success).toBe(false);
        });
    });

    describe('updateStatusSchema', () => {
        it('should validate valid internalStatus', () => {
            const result = updateStatusSchema.safeParse({ body: { internalStatus: "SHORTLISTED" } });
            expect(result.success).toBe(true);
        });

        it('should fail for invalid internalStatus', () => {
            const result = updateStatusSchema.safeParse({ body: { internalStatus: "INVALID_STATUS" } });
            expect(result.success).toBe(false);
        });
    });

    describe('updateQueueSchema', () => {
        it('should validate valid queueStatus', () => {
            const result = updateQueueSchema.safeParse({ body: { queueStatus: "shortlist_queue" } });
            expect(result.success).toBe(true);
        });

        it('should fail for invalid queueStatus', () => {
            const result = updateQueueSchema.safeParse({ body: { queueStatus: "invalid_queue" } });
            expect(result.success).toBe(false);
        });
    });
});
