import { jest } from '@jest/globals';

export const mockGoogleAuth = {
    verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: jest.fn().mockReturnValue({
            email: 'testuser@gmail.com',
            name: 'Test User',
            picture: 'https://lh3.googleusercontent.com/a/test-picture',
            sub: '1234567890'
        })
    })
};
