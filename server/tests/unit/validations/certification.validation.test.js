import { certificationValidationSchema, updateCertificationValidationSchema } from '../../../src/validations/certification.validate.js';

describe('Certification Validation', () => {
    describe('certificationValidationSchema', () => {
        it('should validate valid certification', () => {
            const result = certificationValidationSchema.safeParse({
                certificationName: "AWS Certified Solutions Architect",
                issuingOrganization: "Amazon Web Services",
                issueDate: "2023-01-01",
                expirationDate: "2026-01-01"
            });
            expect(result.success).toBe(true);
        });

        it('should fail if issueDate is in the future compared to expirationDate', () => {
            const result = certificationValidationSchema.safeParse({
                certificationName: "AWS",
                issuingOrganization: "Amazon",
                issueDate: "2026-01-01",
                expirationDate: "2023-01-01"
            });
            expect(result.success).toBe(false);
            expect(result.error.issues[0].message).toBe("Expiration date cannot be before issue date");
        });

        it('should require certificationName', () => {
            const result = certificationValidationSchema.safeParse({
                issuingOrganization: "Amazon",
                issueDate: "2023-01-01"
            });
            expect(result.success).toBe(false);
        });
    });

    describe('updateCertificationValidationSchema', () => {
        it('should allow partial updates', () => {
            const result = updateCertificationValidationSchema.safeParse({
                certificationName: "Updated Name"
            });
            expect(result.success).toBe(true);
        });
    });
});
