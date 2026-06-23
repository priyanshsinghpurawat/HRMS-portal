import { jest } from '@jest/globals';
import { registerUser, loginUser } from '../../../src/controllers/auth.controller.js';
import { User } from '../../../src/models/User.model.js';
import { Profile } from '../../../src/models/Profile.model.js';

describe('Auth Controller', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('should successfully register a user', async () => {
            mockReq.body = {
                name: 'Test',
                email: 'test@example.com',
                password: 'password',
                phone: '1234567890'
            };

            jest.spyOn(User, 'findOne').mockResolvedValue(null);
            
            const mockCreatedUser = { _id: 'user123', name: 'Test', email: 'test@example.com' };
            jest.spyOn(User, 'create').mockResolvedValue(mockCreatedUser);
            
            jest.spyOn(User, 'findById').mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCreatedUser)
            });

            jest.spyOn(Profile, 'create').mockResolvedValue({});

            await registerUser(mockReq, mockRes, mockNext);

            expect(User.findOne).toHaveBeenCalled();
            expect(User.create).toHaveBeenCalled();
            expect(Profile.create).toHaveBeenCalledWith({ user: 'user123' });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalled();
        });

        it('should throw error if user already exists', async () => {
            mockReq.body = { email: 'test@example.com' };
            jest.spyOn(User, 'findOne').mockResolvedValue({ _id: 'existing' });

            await registerUser(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(409);
        });
    });

    describe('loginUser', () => {
        it('should successfully login a user', async () => {
            mockReq.body = { email: 'test@example.com', password: 'password' };

            const mockUser = {
                _id: 'user123',
                role: 'candidate',
                isPasswordCorrect: jest.fn().mockResolvedValue(true),
                generateAccessToken: jest.fn().mockReturnValue('access_token'),
                generateRefreshToken: jest.fn().mockReturnValue('refresh_token'),
                save: jest.fn().mockResolvedValue(true)
            };

            jest.spyOn(User, 'findOne').mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            jest.spyOn(User, 'findById').mockImplementation((id) => {
                if (id === 'user123') {
                    const q = { session: jest.fn().mockResolvedValue(mockUser), select: jest.fn().mockResolvedValue(mockUser) };
                    return q;
                }
            });

            await loginUser(mockReq, mockRes, mockNext);

            expect(mockUser.isPasswordCorrect).toHaveBeenCalledWith('password');
            expect(mockRes.cookie).toHaveBeenCalledTimes(2);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalled();
        });
    });
});
