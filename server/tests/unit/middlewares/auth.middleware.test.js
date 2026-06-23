import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { verifyJWT } from '../../../src/middlewares/auth.middleware.js';
import { User } from '../../../src/models/User.model.js';
import { HR } from '../../../src/models/HR.model.js';

describe('verifyJWT Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            cookies: {},
            header: jest.fn()
        };
        mockRes = {};
        mockNext = jest.fn();
        process.env.JWT_SECRET_KEY = 'test_secret';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should verify token and attach user to request', async () => {
        mockReq.header.mockReturnValue('Bearer valid_token');
        const decodedToken = { id: 'user123' };
        
        jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);
        const mockUser = { _id: 'user123', role: 'candidate' };
        
        jest.spyOn(User, 'findById').mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });

        await verifyJWT(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
        expect(mockReq.user).toEqual(mockUser);
    });

    it('should throw Error if no token provided', async () => {
        mockReq.header.mockReturnValue(undefined);

        await verifyJWT(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        const errorArgs = mockNext.mock.calls[0][0];
        expect(errorArgs.statusCode).toBe(401);
        expect(errorArgs.message).toBe('Unauthorized request');
    });

    it('should throw Error if invalid token', async () => {
        mockReq.header.mockReturnValue('Bearer invalid_token');
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('jwt malformed');
        });

        await verifyJWT(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        const errorArgs = mockNext.mock.calls[0][0];
        expect(errorArgs.statusCode).toBe(401);
    });

    it('should throw Error if HR account is deactivated', async () => {
        mockReq.header.mockReturnValue('Bearer valid_token');
        const decodedToken = { id: 'hr123' };
        jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);
        
        const mockUser = { _id: 'hr123', role: 'hr' };
        jest.spyOn(User, 'findById').mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser)
        });
        
        jest.spyOn(HR, 'findOne').mockResolvedValue({ isActive: false });

        await verifyJWT(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        const errorArgs = mockNext.mock.calls[0][0];
        expect(errorArgs.statusCode).toBe(401); // Note: verifyJWT catches ApiError and throws 401
    });
});
