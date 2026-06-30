import mongoose, { Schema } from "mongoose";

const leavePolicySchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true
        },
        leaveName: {
            type: String,
            required: [true, "Leave Name is required"],
            trim: true
        },
        leaveCode: {
            type: String,
            required: [true, "Leave Code is required"],
            trim: true,
            uppercase: true
        },
        isPaid: {
            type: Boolean,
            required: [true, "Paid/Unpaid status is required"]
        },
        annualAllocation: {
            type: Number,
            required: [true, "Annual allocation is required"],
            min: 0
        },
        carryForwardAllowed: {
            type: Boolean,
            default: false
        },
        maxCarryForward: {
            type: Number,
            default: 0
        },
        halfDayAllowed: {
            type: Boolean,
            default: false
        },
        requiresApproval: {
            type: Boolean,
            default: true
        },
        effectiveFrom: {
            type: Date,
            required: [true, "Effective from date is required"]
        },
        effectiveTo: {
            type: Date,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// A unique combination of company, leaveCode, and active status ensuring only one active version per code
leavePolicySchema.index({ companyId: 1, leaveCode: 1, isActive: 1 });

export const LeavePolicy = mongoose.model("LeavePolicy", leavePolicySchema);
