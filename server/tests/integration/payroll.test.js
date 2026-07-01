import request from 'supertest';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { app } from '../../src/app.js';
import { Company } from '../../src/models/Company.model.js';
import { User } from '../../src/models/User.model.js';
import { Employee } from '../../src/models/Employee.model.js';
import { PayrollSetting } from '../../src/models/PayrollSetting.model.js';
import { SalaryStructure } from '../../src/models/SalaryStructure.model.js';
import { Payroll } from '../../src/models/Payroll.model.js';
import jwt from 'jsonwebtoken';

describe('Payroll Engine Integration Tests', () => {
    let companyAdminToken;
    let companyId;
    let employeeId;
    let salaryStructure;
    let user;

    beforeEach(async () => {
        jest.setTimeout(30000);
        // 1. Create a mock Company and User
        user = await User.create({
            name: "Test Admin",
            email: "admin@test.com",
            password: "Password123!",
            role: "company",
            isVerified: true
        });

        const company = await Company.create({
            ownerId: user._id,
            name: "Test Company Ltd",
            gstId: "22AAAAA0000A1Z5",
            tanId: "ACME12345E",
            isEmailVerified: true
        });

        companyId = company._id;
        user.companyId = company._id;
        await user.save();

        // Generate Auth Token
        companyAdminToken = jwt.sign(
            { id: user._id, _id: user._id, role: user.role, companyId: company._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        // 2. Setup Payroll Settings
        await PayrollSetting.create({
            companyId: company._id,
            isPayrollEnabled: true,
            taxConfig: {
                pf: {
                    enabled: true,
                    employeeContribution: 12,
                    employerContribution: 12
                },
                esic: {
                    enabled: true
                },
                pt: {
                    enabled: true
                }
            }
        });

        // 3. Create an Employee
        const empUser = await User.create({
            name: "John Doe",
            email: "john@test.com",
            password: "Password123!",
            role: "employee",
            isVerified: true
        });

        const employee = await Employee.create({
            user: empUser._id,
            company: company._id,
            employeeId: "EMP-001",
            personalEmail: "john@test.com",
            joiningDate: new Date("2025-01-01"),
            employmentStatus: "active"
        });
        employeeId = employee._id;

        // 4. Assign Salary Structure
        salaryStructure = await SalaryStructure.create({
            employeeId: employee._id,
            companyId: company._id,
            effectiveFrom: new Date("2025-01-01"),
            grossSalary: 50000,
            createdBy: user._id,
            components: {
                basicSalary: 25000,
                hra: 10000,
                conveyanceAllowance: 5000,
                medicalAllowance: 5000,
                specialAllowance: 5000,
                otherAllowances: 0
            }
        });
    });

    it('should generate a payroll successfully for an employee', async () => {
        const payload = {
            month: 5,
            year: 2026,
            employeeId: employeeId.toString()
        };

        const res = await request(app)
            .post('/api/v1/company/payroll/generate')
            .set('Authorization', `Bearer ${companyAdminToken}`)
            .send(payload);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.grossSalary).toBeDefined();
        
        // Verify it was stored in DB
        const dbPayroll = await Payroll.findOne({ companyId, employeeId });
        expect(dbPayroll).not.toBeNull();
        expect(dbPayroll.status).toBe('Draft');
    });

    it('should prevent duplicate payroll generation for the same month', async () => {
        // Generate first time
        await Payroll.create({
            companyId,
            employeeId,
            payrollMonth: 5,
            payrollYear: 2026,
            status: 'Draft',
            grossSalary: 50000,
            netSalary: 45000,
            generatedBy: user._id,
            salarySnapshot: salaryStructure.toObject(),
            attendanceSummary: {
                totalCalendarDays: 31,
                workingDays: 30,
                paidDays: 30,
                unpaidDays: 0,
                absentDays: 0,
                presentDays: 30,
                halfDays: 0,
                paidLeaves: 0,
                companyHolidays: 0,
                weeklyOffs: 1
            },
            earnings: { basicSalary: 25000, hra: 10000 },
            deductions: { pf: 1800, pt: 200 }
        });

        // Try generating again
        const payload = {
            month: 5,
            year: 2026,
            employeeId: employeeId.toString()
        };

        const res = await request(app)
            .post('/api/v1/company/payroll/generate')
            .set('Authorization', `Bearer ${companyAdminToken}`)
            .send(payload);

        // Based on the duplicate prevention logic, this should return 409
        expect(res.statusCode).toBe(409); 
    });
});
