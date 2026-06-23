import mongoose from 'mongoose';
import { Attendance } from '../../src/models/Attendance.model.js';

export const attendanceFactory = {
    build: (overrides = {}) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
            employeeId: new mongoose.Types.ObjectId(),
            companyId: new mongoose.Types.ObjectId(),
            date: today,
            status: 'Absent',
            ...overrides
        };
    },

    create: async (overrides = {}) => {
        const attendanceData = attendanceFactory.build(overrides);
        return await Attendance.create(attendanceData);
    }
};
