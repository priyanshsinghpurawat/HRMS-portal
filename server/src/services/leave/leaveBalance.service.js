import { LeaveBalance } from "../../models/LeaveBalance.model.js";
import { LeavePolicy } from "../../models/LeavePolicy.model.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Dynamically computes remaining leaves
 */
export const calculateRemainingLeaves = (balance) => {
    return balance.totalAllocation + balance.carryForwardBalance - balance.usedLeaves;
};

/**
 * Retrieves an employee's leave balances with dynamic calculations
 */
export const getEmployeeLeaveBalances = async (companyId, employeeId, financialYear) => {
    const balances = await LeaveBalance.find({
        companyId,
        employeeId,
        financialYear
    }).populate("leavePolicyId", "leaveName leaveCode isPaid");

    // Map to include the dynamically calculated remaining leaves
    return balances.map(b => ({
        ...b.toObject(),
        remainingLeaves: calculateRemainingLeaves(b)
    }));
};

/**
 * Retrieves a specific balance record and validates if sufficient balance exists
 */
export const checkAndGetSufficientBalance = async (companyId, employeeId, leavePolicyId, financialYear, requestedDays) => {
    const balance = await LeaveBalance.findOne({
        companyId,
        employeeId,
        leavePolicyId,
        financialYear
    });

    if (!balance) {
        throw new ApiError(404, "Leave balance record not found for this policy and financial year");
    }

    const remainingLeaves = calculateRemainingLeaves(balance);

    if (remainingLeaves < requestedDays) {
        throw new ApiError(400, `Insufficient leave balance. You have ${remainingLeaves} days remaining, but requested ${requestedDays} days.`);
    }

    return balance;
};

/**
 * Initializes a balance for an employee. Used mostly by HR utilities or on-boarding.
 */
export const initializeBalance = async (companyId, employeeId, leavePolicyId, financialYear) => {
    const policy = await LeavePolicy.findOne({ _id: leavePolicyId, companyId, isActive: true });
    if (!policy) {
        throw new ApiError(404, "Active leave policy not found");
    }

    const existing = await LeaveBalance.findOne({ companyId, employeeId, leavePolicyId, financialYear });
    if (existing) {
        return existing;
    }

    const balance = await LeaveBalance.create({
        companyId,
        employeeId,
        leavePolicyId,
        financialYear,
        totalAllocation: policy.annualAllocation,
        carryForwardBalance: 0,
        usedLeaves: 0
    });

    return balance;
};
