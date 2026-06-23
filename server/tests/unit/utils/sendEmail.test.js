import { jest } from '@jest/globals';
import { sendEmail } from '../../../src/utils/sendEmail.js';

describe('sendEmail', () => {
    let consoleLogSpy;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    it('should log email details and return true', async () => {
        const result = await sendEmail({
            to: 'test@example.com',
            subject: 'Test Subject',
            body: 'Test Body'
        });

        expect(result).toBe(true);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('To: test@example.com'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Subject: Test Subject'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Body:\nTest Body'));
    });
});
