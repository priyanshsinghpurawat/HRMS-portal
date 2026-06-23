import { generateTempPassword } from '../../../src/utils/RandomPassword.js';

describe('generateTempPassword', () => {
    it('should generate a password of default length 8', () => {
        const password = generateTempPassword();
        expect(password.length).toBe(8);
    });

    it('should generate a password of specified length', () => {
        const password = generateTempPassword(16);
        expect(password.length).toBe(16);
    });

    it('should contain uppercase, lowercase, numbers, and special characters', () => {
        const password = generateTempPassword(20);
        expect(password).toMatch(/[A-Z]/);
        expect(password).toMatch(/[a-z]/);
        expect(password).toMatch(/[0-9]/);
        expect(password).toMatch(/[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/);
    });
});
