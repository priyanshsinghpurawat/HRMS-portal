import { jest } from '@jest/globals';
import { validateJobWithAI } from '../../../src/services/moderation.service.js';

describe('Moderation Service - validateJobWithAI', () => {
    let originalEnv;

    beforeEach(() => {
        originalEnv = process.env.GEMINI_API_KEY;
        process.env.GEMINI_API_KEY = 'test_key';
        global.fetch = jest.fn();
    });

    afterEach(() => {
        process.env.GEMINI_API_KEY = originalEnv;
        jest.restoreAllMocks();
    });

    it('should throw an error if GEMINI_API_KEY is missing', async () => {
        delete process.env.GEMINI_API_KEY;
        await expect(validateJobWithAI({})).rejects.toThrow('Gemini API Key is missing in environment variables');
    });

    it('should return safe moderation result from AI', async () => {
        const mockAIResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: JSON.stringify({ isSafe: true, riskScore: 10, reasons: ['Looks good'] })
                    }]
                }
            }]
        };

        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => mockAIResponse
        });

        const jobData = { title: 'Engineer', description: 'Good job' };
        const result = await validateJobWithAI(jobData);

        expect(result.isSafe).toBe(true);
        expect(result.riskScore).toBe(10);
        expect(result.reasons).toEqual(['Looks good']);
    });

    it('should fall back to offline verification on API failure', async () => {
        global.fetch.mockRejectedValue(new Error('API Down'));

        const jobData = { title: 'Engineer', description: 'Please pay a registration fee to apply.' };
        const result = await validateJobWithAI(jobData);

        // Fallback verification should catch the "registration fee" phrase
        expect(result.isSafe).toBe(false);
        expect(result.riskScore).toBe(80);
        expect(result.reasons).toContain('Mentions candidate fees or deposits');
    });

    it('should return safe from offline fallback if no suspicious keywords', async () => {
        global.fetch.mockRejectedValue(new Error('API Down'));

        const jobData = { title: 'Engineer', description: 'Just a normal job description.' };
        const result = await validateJobWithAI(jobData);

        expect(result.isSafe).toBe(true);
        expect(result.riskScore).toBe(0);
    });
});
