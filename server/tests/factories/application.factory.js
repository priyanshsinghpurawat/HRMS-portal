import mongoose from 'mongoose';
import { Application } from '../../src/models/Application.model.js';

export const applicationFactory = {
    build: (overrides = {}) => ({
        job: new mongoose.Types.ObjectId(),
        applicant: new mongoose.Types.ObjectId(),
        status: 'APPLIED',
        resume: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        coverLetter: 'I am very interested in this role.',
        ...overrides
    }),

    create: async (overrides = {}) => {
        const applicationData = applicationFactory.build(overrides);
        return await Application.create(applicationData);
    }
};
