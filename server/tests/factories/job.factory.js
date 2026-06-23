import mongoose from 'mongoose';
import { Job } from '../../src/models/Job.model.js';

export const jobFactory = {
    build: (overrides = {}) => ({
        title: 'Software Engineer',
        description: 'We are looking for a skilled Software Engineer.',
        company: new mongoose.Types.ObjectId(),
        createdBy: new mongoose.Types.ObjectId(), // HR reference
        department: 'Engineering',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        salaryMin: 50000,
        salaryMax: 100000,
        location: 'Remote',
        skills: ['JavaScript', 'React', 'Node.js'],
        status: 'active',
        ...overrides
    }),

    create: async (overrides = {}) => {
        const jobData = jobFactory.build(overrides);
        return await Job.create(jobData);
    }
};
