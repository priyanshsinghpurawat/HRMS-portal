import mongoose, { Schema } from "mongoose";

const leaveBalanceSchema = new Schema(
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
        financialYear: {
            type: String,
            required: [true, "Financial Year is required"],
            trim: true
        },
        totalAllocation: {
            type: Number,
            required: [true, "Total Allocation is required"],
            min: 0
        },
        carryForwardBalance: {
            type: Number,
            default: 0,
            min: 0
        },
        usedLeaves: {
            type: Number,
            default: 0,
            min: 0
        }
        // Note: remainingLeaves is not stored. It will be computed as (totalAllocation + carryForwardBalance - usedLeaves)
    },
    {
        timestamps: true
    }
);

// One balance record per policy per employee per financial year
leaveBalanceSchema.index({ employeeId: 1, leavePolicyId: 1, financialYear: 1 }, { unique: true });

export const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
