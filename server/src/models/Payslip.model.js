import mongoose, { Schema } from "mongoose";

const payslipSchema = new Schema(
    {
        payrollId: {
            type: Schema.Types.ObjectId,
            ref: "Payroll",
            required: true,
            unique: true // Exactly one payslip per payroll
        },
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        payslipNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        payrollMonth: {
            type: Number,
            required: true
        },
        payrollYear: {
            type: Number,
            required: true
        },
        
        // Copied from Payroll Snapshot to ensure Payslip immutability and standalone capability
        salarySnapshot: { type: Object, required: true },
        attendanceSummary: { type: Object, required: true },
        leaveSummary: { type: Object, default: {} }, // Placeholders for future expanded leave summaries
        holidaySummary: { type: Object, default: {} }, // Placeholders for future expanded holiday summaries
        earnings: { type: Object, required: true },
        deductions: { type: Object, required: true },
        
        grossSalary: { type: Number, required: true },
        netSalary: { type: Number, required: true },
        
        status: {
            type: String,
            enum: ['Generated', 'Published', 'Downloaded', 'Cancelled'],
            default: 'Generated',
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
        },
        
        // Audit Logs directly embedded or managed separately. We'll embed lightweight logs here.
        auditLogs: [{
            action: { type: String, required: true },
            performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
            timestamp: { type: Date, default: Date.now }
        }]
    },
    {
        timestamps: true
    }
);

// Search optimization index
payslipSchema.index({ companyId: 1, payrollMonth: 1, payrollYear: 1 });

export const Payslip = mongoose.model("Payslip", payslipSchema);
