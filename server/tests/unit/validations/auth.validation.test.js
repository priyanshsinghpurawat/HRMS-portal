import { registerSchema, loginSchema, changePasswordSchema } from '../../../src/validations/auth.validation.js';

describe('Auth Validations', () => {
    describe('registerSchema', () => {
        it('should pass with valid data', () => {
            const data = {
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    phone: '+919876543210'
                }
            };
            const result = registerSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail if email is invalid', () => {
            const data = {
                body: {
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'password123',
                    phone: '+919876543210'
                }
            };
            const result = registerSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should fail if password is too short', () => {
            const data = {
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'short',
                    phone: '+919876543210'
                }
            };
            const result = registerSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('loginSchema', () => {
        it('should pass with valid data', () => {
            const data = {
                body: {
                    email: 'test@example.com',
                    password: 'password123'
                }
            };
            const result = loginSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail if email is missing', () => {
            const data = {
                body: {
                    password: 'password123'
                }
            };
            const result = loginSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
});
