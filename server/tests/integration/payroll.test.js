import request from 'supertest';
import mongoose from 'mongoose';
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

    beforeEach(async () => {
        // 1. Create a mock Company and User
        const user = await User.create({
            name: "Test Admin",
            email: "admin@test.com",
            password: "Password123!",
            role: "company",
            isVerified: true
        });

        const company = await Company.create({
            user: user._id,
            companyName: "Test Company Ltd",
            email: "contact@test.com"
        });

        companyId = company._id;
        user.companyId = company._id;
        await user.save();

        // Generate Auth Token
        companyAdminToken = jwt.sign(
            { _id: user._id, role: user.role, companyId: company._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1h" }
        );

        // 2. Setup Payroll Settings
        await PayrollSetting.create({
            companyId: company._id,
            pfEnabled: true,
            pfEmployerContribution: 12,
            pfEmployeeContribution: 12,
            esicEnabled: true,
            ptEnabled: true
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
            joiningDate: new Date("2025-01-01"),
            employmentStatus: "active"
        });
        employeeId = employee._id;

        // 4. Assign Salary Structure
        await SalaryStructure.create({
            employeeId: employee._id,
            companyId: company._id,
            effectiveDate: new Date("2025-01-01"),
            annualCTC: 600000,
            monthlyGross: 50000,
            components: {
                basic: 25000,
                hra: 10000,
                conveyance: 5000,
                medical: 5000,
                special: 5000
            }
        });
    });

    it('should generate a payroll successfully for an employee', async () => {
        const payload = {
            payrollMonth: 5,
            payrollYear: 2026,
            employeeId: employeeId.toString()
        };

        const res = await request(app)
            .post('/api/v1/company/payroll/generate')
            .set('Authorization', `Bearer ${companyAdminToken}`)
            .send(payload);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.payrolls.length).toBe(1);
        expect(res.body.data.payrolls[0].grossSalary).toBeDefined();
        
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
            workingDays: 30,
            paidDays: 30,
            attendanceSummary: { present: 30, absent: 0, halfDays: 0, paidLeaves: 0, unpaidLeaves: 0, totalPaidDays: 30 },
            earnings: { basic: 25000, hra: 10000 },
            deductions: { pf: 1800, pt: 200 }
        });

        // Try generating again
        const payload = {
            payrollMonth: 5,
            payrollYear: 2026,
            employeeId: employeeId.toString()
        };

        const res = await request(app)
            .post('/api/v1/company/payroll/generate')
            .set('Authorization', `Bearer ${companyAdminToken}`)
            .send(payload);

        // Based on the duplicate prevention logic, this should either return 400 or just skip
        expect(res.statusCode).toBe(400); 
    });
});
