import mongoose, { Schema } from "mongoose";

// Create an Audit Log Schema explicitly for workflow tracking
const payrollAuditSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    payrollId: { type: Schema.Types.ObjectId, ref: "Payroll", required: true, index: true },
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    previousState: { type: String },
    newState: { type: String },
    notes: { type: String },
    metadata: { type: Object }
}, {
    timestamps: true
});

// Protect from modification
payrollAuditSchema.pre('findOneAndUpdate', function(next) {
    next(new Error('Audit logs are immutable and cannot be updated.'));
});
payrollAuditSchema.pre('updateOne', function(next) {
    next(new Error('Audit logs are immutable and cannot be updated.'));
});

export const PayrollAudit = mongoose.model("PayrollAudit", payrollAuditSchema);

/**
 * Creates an immutable audit log entry
 */
export const logWorkflowAudit = async (companyId, payrollId, action, performedBy, previousState, newState, notes = "", metadata = {}) => {
    return await PayrollAudit.create({
        companyId,
        payrollId,
        action,
        performedBy,
        previousState,
        newState,
        notes,
        metadata
    });
};

/**
 * Retrieves audit history for a specific payroll
 */
export const getPayrollAuditHistory = async (companyId, payrollId) => {
    return await PayrollAudit.find({ companyId, payrollId })
        .populate("performedBy", "name email role")
        .sort({ createdAt: -1 });
};
