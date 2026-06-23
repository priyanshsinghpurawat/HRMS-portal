import { ApiError } from '../../../src/utils/ApiError.js';

describe('ApiError', () => {
    it('should correctly set the error properties', () => {
        const error = new ApiError(404, 'Not Found', ['Resource missing']);
        
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Not Found');
        expect(error.errors).toEqual(['Resource missing']);
        expect(error.success).toBe(false);
        expect(error.data).toBeNull();
    });

    it('should use default message if none is provided', () => {
        const error = new ApiError(500);
        expect(error.message).toBe('Something went wrong');
    });

    it('should retain the stack trace if provided', () => {
        const error = new ApiError(400, 'Bad Request', [], 'Custom Stack Trace');
        expect(error.stack).toBe('Custom Stack Trace');
    });
});
