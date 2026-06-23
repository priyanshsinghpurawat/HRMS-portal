import { jest } from '@jest/globals';
import { authorizeRoles } from '../../../src/middlewares/role.middleware.js';
import { ApiError } from '../../../src/utils/ApiError.js';

describe('authorizeRoles Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = { user: {} };
        mockRes = {};
        mockNext = jest.fn();
    });

    it('should call next if user has allowed role', () => {
        mockReq.user.role = 'admin';
        const middleware = authorizeRoles('admin', 'company');
        
        middleware(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).not.toHaveBeenCalledWith(expect.any(ApiError));
    });

    it('should throw ApiError if user role is not allowed', () => {
        mockReq.user.role = 'candidate';
        const middleware = authorizeRoles('admin', 'company');
        
        middleware(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
        const errorArgs = mockNext.mock.calls[0][0];
        expect(errorArgs.statusCode).toBe(403);
        expect(errorArgs.message).toContain('is not allowed to access this resource');
    });

    it('should throw ApiError if user is not attached to request', () => {
        mockReq.user = undefined;
        const middleware = authorizeRoles('admin');
        
        middleware(mockReq, mockRes, mockNext);
        
        expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
        const errorArgs = mockNext.mock.calls[0][0];
        expect(errorArgs.statusCode).toBe(401);
    });
});
