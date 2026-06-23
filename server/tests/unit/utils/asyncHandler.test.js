import { jest } from '@jest/globals';
import { asyncHandler } from '../../../src/utils/asyncHandler.js';

describe('asyncHandler', () => {
    it('should execute the request handler and resolve', async () => {
        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        
        const handler = jest.fn().mockResolvedValue('success');
        const wrappedHandler = asyncHandler(handler);
        
        await wrappedHandler(req, res, next);
        
        expect(handler).toHaveBeenCalledWith(req, res, next);
        expect(next).not.toHaveBeenCalled();
    });

    it('should catch errors and pass them to next()', async () => {
        const req = {};
        const res = {};
        const next = jest.fn();
        const error = new Error('Test Error');
        
        const handler = jest.fn().mockRejectedValue(error);
        const wrappedHandler = asyncHandler(handler);
        
        await wrappedHandler(req, res, next);
        
        expect(handler).toHaveBeenCalledWith(req, res, next);
        expect(next).toHaveBeenCalledWith(error);
    });
});
