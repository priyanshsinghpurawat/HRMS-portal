import mongoose from 'mongoose';
import { Company } from '../../src/models/Company.model.js';

export const companyFactory = {
    build: (overrides = {}) => ({
        name: `Test Company ${Date.now()}`,
        description: 'A test company for automated tests.',
        website: `https://testcompany${Date.now()}.com`,
        ownerId: new mongoose.Types.ObjectId(),
        tanId: `ABCD${Math.floor(10000 + Math.random() * 90000)}E`,
        gstId: `22ABCDE${Math.floor(1000 + Math.random() * 9000)}F1Z5`,
        isActive: true,
        ...overrides
    }),

    create: async (overrides = {}) => {
        const companyData = companyFactory.build(overrides);
        return await Company.create(companyData);
    }
};
