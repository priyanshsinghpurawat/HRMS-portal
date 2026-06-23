import { companySchemaValidation, companyLoginSchema } from '../../../src/validations/company.validation.js';

describe('Company Validations', () => {
    describe('companySchemaValidation', () => {
        it('should pass with valid company data', () => {
            const data = {
                email: 'company@example.com',
                password: 'password123',
                name: 'Test Company',
                tanId: 'ABCD12345E',
                gstId: '22ABCDE1234F1Z5'
            };
            const result = companySchemaValidation.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail if tanId is invalid', () => {
            const data = {
                email: 'company@example.com',
                password: 'password123',
                name: 'Test Company',
                tanId: 'invalid-tan',
                gstId: '22ABCDE1234F1Z5'
            };
            const result = companySchemaValidation.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should fail if gstId is invalid', () => {
            const data = {
                email: 'company@example.com',
                password: 'password123',
                name: 'Test Company',
                tanId: 'ABCD12345E',
                gstId: 'invalid-gst'
            };
            const result = companySchemaValidation.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('companyLoginSchema', () => {
        it('should pass with valid credentials', () => {
            const data = {
                body: {
                    email: 'company@example.com',
                    password: 'password123'
                }
            };
            const result = companyLoginSchema.safeParse(data);
            expect(result.success).toBe(true);
        });
    });
});
