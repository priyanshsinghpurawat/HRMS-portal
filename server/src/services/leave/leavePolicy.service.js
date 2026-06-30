import { LeavePolicy } from "../../models/LeavePolicy.model.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Creates a new Leave Policy
 */
export const createLeavePolicy = async (companyId, payload) => {
    // Check if the leave code already exists and is active for this company
    const existingPolicy = await LeavePolicy.findOne({
        companyId,
        leaveCode: payload.leaveCode.toUpperCase(),
        isActive: true
    });

    if (existingPolicy) {
        throw new ApiError(409, `An active leave policy with code ${payload.leaveCode} already exists.`);
    }

    const policy = await LeavePolicy.create({
        companyId,
        ...payload,
        leaveCode: payload.leaveCode.toUpperCase()
    });

    return policy;
};

/**
 * Updates a Leave Policy using Versioning
 */
export const updateLeavePolicy = async (companyId, policyId, payload) => {
    const existingPolicy = await LeavePolicy.findOne({
        _id: policyId,
        companyId,
        isActive: true
    });

    if (!existingPolicy) {
        throw new ApiError(404, "Active Leave Policy not found");
    }

    const now = new Date();

    // 1. Archive the current version
    existingPolicy.isActive = false;
    existingPolicy.effectiveTo = now;
    await existingPolicy.save();

    // 2. Create the new version
    const newPolicyData = {
        companyId,
        leaveName: payload.leaveName !== undefined ? payload.leaveName : existingPolicy.leaveName,
        leaveCode: existingPolicy.leaveCode, // code cannot be changed
        isPaid: payload.isPaid !== undefined ? payload.isPaid : existingPolicy.isPaid,
        annualAllocation: payload.annualAllocation !== undefined ? payload.annualAllocation : existingPolicy.annualAllocation,
        carryForwardAllowed: payload.carryForwardAllowed !== undefined ? payload.carryForwardAllowed : existingPolicy.carryForwardAllowed,
        maxCarryForward: payload.maxCarryForward !== undefined ? payload.maxCarryForward : existingPolicy.maxCarryForward,
        halfDayAllowed: payload.halfDayAllowed !== undefined ? payload.halfDayAllowed : existingPolicy.halfDayAllowed,
        requiresApproval: payload.requiresApproval !== undefined ? payload.requiresApproval : existingPolicy.requiresApproval,
        effectiveFrom: payload.effectiveFrom ? new Date(payload.effectiveFrom) : now,
        isActive: true
    };

    const newPolicy = await LeavePolicy.create(newPolicyData);

    return newPolicy;
};

/**
 * Retrieves all active Leave Policies for a company
 */
export const getActiveLeavePolicies = async (companyId) => {
    return await LeavePolicy.find({ companyId, isActive: true }).sort({ createdAt: -1 });
};
