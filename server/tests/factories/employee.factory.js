import mongoose from 'mongoose';
import { Employee } from '../../src/models/Employee.model.js';

export const employeeFactory = {
    build: (overrides = {}) => ({
        user: new mongoose.Types.ObjectId(),
        company: new mongoose.Types.ObjectId(),
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        personalEmail: `emp${Date.now()}@personal.com`,
        companyEmail: `emp${Date.now()}@company.com`,
        department: 'Engineering',
        designation: 'Software Engineer',
        employmentStatus: 'active',
        ...overrides
    }),

    create: async (overrides = {}) => {
        const employeeData = employeeFactory.build(overrides);
        return await Employee.create(employeeData);
    }
};
