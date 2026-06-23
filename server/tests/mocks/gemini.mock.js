import { jest } from '@jest/globals';

export const mockGemini = {
    getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
            response: {
                text: jest.fn().mockReturnValue(JSON.stringify({
                    isSafe: true,
                    score: 95,
                    reasoning: 'The job posting looks legitimate.',
                    category: 'Safe Job'
                }))
            }
        })
    })
};
