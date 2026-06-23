import { blockSchema } from '../../../src/validations/admin.validation.js';

describe('Admin Validation', () => {
    describe('blockSchema', () => {
        it('should validate valid reason', () => {
            const result = blockSchema.safeParse({ body: { reason: "Violated terms of service" } });
            expect(result.success).toBe(true);
        });

        it('should fail if reason is too short', () => {
            const result = blockSchema.safeParse({ body: { reason: "No" } });
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toBe("Block reason must be at least 3 characters");
        });

        it('should fail if reason is too long', () => {
            const longText = "a".repeat(501);
            const result = blockSchema.safeParse({ body: { reason: longText } });
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toBe("Block reason cannot exceed 500 characters");
        });

        it('should fail if reason is missing', () => {
            const result = blockSchema.safeParse({ body: {} });
            expect(result.success).toBe(false);
        });
    });
});
