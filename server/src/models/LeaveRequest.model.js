import mongoose, { Schema } from "mongoose";

const leaveRequestSchema = new Schema(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: [true, "Employee ID is required"],
            index: true
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true
        },
        leavePolicyId: {
            type: Schema.Types.ObjectId,
            ref: "LeavePolicy",
            required: [true, "Leave Policy ID is required"]
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"]
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"]
        },
        totalDays: {
            type: Number,
            required: [true, "Total days is required"],
            min: 0.5
        },
        halfDayInformation: {
            type: String,
            enum: ['First Half', 'Second Half', 'None'],
            default: 'None'
        },
        reason: {
            type: String,
            required: [true, "Reason is required"],
            trim: true,
            maxlength: 1000
        },
        supportingDocuments: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
            default: 'Pending',
            index: true
        },
        appliedDate: {
            type: Date,
            default: Date.now
        },
        auditLogs: [{
            action: { type: String, enum: ['Approved', 'Rejected', 'Cancelled'] },
            performedBy: { type: Schema.Types.ObjectId, ref: "User" },
            timestamp: { type: Date, default: Date.now },
            remarks: { type: String }
        }]
    },
    {
        timestamps: true
    }
);

export const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
