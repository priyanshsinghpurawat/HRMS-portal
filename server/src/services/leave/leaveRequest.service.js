import { LeaveRequest } from "../../models/LeaveRequest.model.js";
import { LeavePolicy } from "../../models/LeavePolicy.model.js";
import { checkAndGetSufficientBalance } from "./leaveBalance.service.js";
import { ApiError } from "../../utils/ApiError.js";

const getCurrentFinancialYear = () => {
    const today = new Date();
    const month = today.getMonth() + 1; // 1-12
    const year = today.getFullYear();
    // Assuming FY starts in April (India standard)
    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

/**
 * Validates for overlapping leave requests
 */
const checkOverlappingLeaves = async (employeeId, startDate, endDate) => {
    const overlapping = await LeaveRequest.findOne({
        employeeId,
        status: { $in: ['Pending', 'Approved'] },
        $or: [
            { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
        ]
    });

    if (overlapping) {
        throw new ApiError(400, "You already have a pending or approved leave request during these dates.");
    }
};

/**
 * Submits a new leave request
 */
export const submitLeaveRequest = async (companyId, employeeId, payload) => {
    const { leavePolicyId, startDate, endDate, totalDays, halfDayInformation, reason, supportingDocuments } = payload;

    // 1. Validate Policy
    const policy = await LeavePolicy.findOne({ _id: leavePolicyId, companyId, isActive: true });
    if (!policy) {
        throw new ApiError(404, "Leave policy not found or inactive");
    }
    if (halfDayInformation !== 'None' && !policy.halfDayAllowed) {
        throw new ApiError(400, "Half-day leaves are not allowed under this policy.");
    }

    // 2. Validate Balance
    const fy = getCurrentFinancialYear();
    await checkAndGetSufficientBalance(companyId, employeeId, leavePolicyId, fy, totalDays);

    // 3. Validate Overlap
    await checkOverlappingLeaves(employeeId, new Date(startDate), new Date(endDate));

    // 4. Create Request
    const request = await LeaveRequest.create({
        companyId,
        employeeId,
        leavePolicyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays,
        halfDayInformation,
        reason,
        supportingDocuments,
        status: 'Pending'
    });

    return request;
};

/**
 * Retrieves employee's leave requests
 */
export const getEmployeeLeaveRequests = async (companyId, employeeId) => {
    return await LeaveRequest.find({ companyId, employeeId })
        .populate("leavePolicyId", "leaveName leaveCode")
        .sort({ appliedDate: -1 });
};

/**
 * Employee cancels their own pending leave request
 */
export const cancelPendingLeaveRequest = async (companyId, employeeId, leaveId) => {
    const request = await LeaveRequest.findOne({ _id: leaveId, companyId, employeeId, status: 'Pending' });
    if (!request) {
        throw new ApiError(404, "Pending leave request not found");
    }

    request.status = 'Cancelled';
    request.auditLogs.push({
        action: 'Cancelled',
        performedBy: employeeId,
        timestamp: new Date(),
        remarks: "Cancelled by employee"
    });

    await request.save();
    return request;
};
