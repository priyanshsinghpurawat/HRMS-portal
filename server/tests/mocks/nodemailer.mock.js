import { jest } from '@jest/globals';

export const mockSendEmail = jest.fn().mockResolvedValue({
    messageId: '<test-message-id@domain.com>',
    response: '250 Message accepted',
});
