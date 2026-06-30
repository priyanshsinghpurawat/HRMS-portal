import mongoose, { Schema } from "mongoose";

const payrollSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true
        },
        payrollMonth: {
            type: Number, // 1-12
            required: true
        },
        payrollYear: {
            type: Number,
            required: true
        },
        
        // Snapshots (Immutable references of the data at the time of generation)
        salarySnapshot: {
            type: Object, // Stores a snapshot of the SalaryStructure at the time of generation
            required: true
        },
        attendanceSummary: {
            totalCalendarDays: { type: Number, required: true },
            workingDays: { type: Number, required: true },
            paidDays: { type: Number, required: true },
            unpaidDays: { type: Number, required: true },
            absentDays: { type: Number, required: true },
            presentDays: { type: Number, required: true },
            halfDays: { type: Number, required: true },
            paidLeaves: { type: Number, required: true },
            companyHolidays: { type: Number, required: true },
            weeklyOffs: { type: Number, required: true }
        },
        
        // Calculated Financials
        earnings: {
            basicSalary: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            specialAllowance: { type: Number, default: 0 },
            medicalAllowance: { type: Number, default: 0 },
            conveyanceAllowance: { type: Number, default: 0 },
            otherAllowances: { type: Number, default: 0 },
            
            // Additional Earnings
            bonus: { type: Number, default: 0 },
            incentive: { type: Number, default: 0 },
            overtime: { type: Number, default: 0 },
            reimbursement: { type: Number, default: 0 },
            arrears: { type: Number, default: 0 },
            otherEarnings: { type: Number, default: 0 }
        },
        deductions: {
            // Statutory
            pf: { type: Number, default: 0 },
            esic: { type: Number, default: 0 },
            pt: { type: Number, default: 0 },
            tds: { type: Number, default: 0 },
            
            // Additional
            lossOfPay: { type: Number, default: 0 },
            salaryAdvanceRecovery: { type: Number, default: 0 },
            loanRecovery: { type: Number, default: 0 },
            otherDeductions: { type: Number, default: 0 }
        },
        
        grossSalary: { type: Number, required: true },
        netSalary: { type: Number, required: true },
        
        status: {
            type: String,
            enum: ['Draft', 'Generated', 'Approved', 'Locked', 'Paid'],
            default: 'Draft',
            index: true
        },
        generatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        generatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate payroll generation for the same employee in the same period
payrollSchema.index({ companyId: 1, employeeId: 1, payrollMonth: 1, payrollYear: 1 }, { unique: true });

export const Payroll = mongoose.model("Payroll", payrollSchema);
