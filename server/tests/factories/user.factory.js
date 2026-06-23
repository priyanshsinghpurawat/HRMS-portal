import mongoose from 'mongoose';
import { User } from '../../src/models/User.model.js';
import { USER_ROLES } from '../../src/constants/index.js';

export const userFactory = {
    build: (overrides = {}) => ({
        name: 'Test User',
        email: `testuser${Date.now()}@example.com`,
        password: 'Password123!',
        role: USER_ROLES.USER,
        ...overrides
    }),

    create: async (overrides = {}) => {
        const userData = userFactory.build(overrides);
        return await User.create(userData);
    }
};
