import { ApiResponse } from '../../../src/utils/ApiResponse.js';

describe('ApiResponse', () => {
    it('should correctly construct response for status code < 400', () => {
        const response = new ApiResponse(200, { user: 'test' }, 'Success message');
        
        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual({ user: 'test' });
        expect(response.message).toBe('Success message');
        expect(response.success).toBe(true);
    });

    it('should set success to false for status code >= 400', () => {
        const response = new ApiResponse(400, null, 'Error message');
        
        expect(response.statusCode).toBe(400);
        expect(response.message).toBe('Error message');
        expect(response.success).toBe(false);
    });
});
