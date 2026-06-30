import { LeaveRequest } from "../../models/LeaveRequest.model.js";
import { LeaveBalance } from "../../models/LeaveBalance.model.js";
import { LeavePolicy } from "../../models/LeavePolicy.model.js";
import { syncApprovedLeaveToAttendance } from "./attendanceSync.service.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * HR handles leave request approval/rejection
 */
export const processLeaveApproval = async (companyId, hrId, leaveId, action, remarks) => {
    const request = await LeaveRequest.findOne({ _id: leaveId, companyId }).populate("leavePolicyId");
    
    if (!request) {
        throw new ApiError(404, "Leave request not found");
    }

    // You can only approve/reject pending requests
    if (request.status !== 'Pending' && action !== 'Cancelled') {
        throw new ApiError(400, `Cannot process a leave that is already ${request.status}`);
    }

    // You can only cancel an approved request
    if (action === 'Cancelled' && request.status !== 'Approved') {
        throw new ApiError(400, "Only approved leaves can be cancelled by HR.");
    }

    const previousStatus = request.status;
    request.status = action;
    request.auditLogs.push({
        action,
        performedBy: hrId,
        timestamp: new Date(),
        remarks: remarks || ""
    });

    // Handle Balance Deductions and Additions
    const policy = request.leavePolicyId;
    const fy = getFinancialYearFromDate(request.startDate);

    const balance = await LeaveBalance.findOne({
        companyId,
        employeeId: request.employeeId,
        leavePolicyId: policy._id,
        financialYear: fy
    });

    if (!balance && action === 'Approved') {
        throw new ApiError(400, "Leave balance record missing for this employee/policy/FY. Cannot approve.");
    }

    if (action === 'Approved') {
        // Deduct balance
        balance.usedLeaves += request.totalDays;
        await balance.save();

        // Sync with Attendance Module
        await syncApprovedLeaveToAttendance(request, policy, hrId);
    } 
    else if (action === 'Cancelled' && previousStatus === 'Approved') {
        // Refund balance if cancelled after being approved
        if (balance) {
            balance.usedLeaves -= request.totalDays;
            if (balance.usedLeaves < 0) balance.usedLeaves = 0; // safety net
            await balance.save();
        }
        
        // Note: Reverting attendance is complex as they might have checked in.
        // We log it, but typically HR manually adjusts attendance if a past leave is cancelled.
    }

    await request.save();
    return request;
};

/**
 * HR views all leaves for the company
 */
export const getAllCompanyLeaves = async (companyId, query = {}) => {
    const filter = { companyId };
    
    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.status) filter.status = query.status;

    return await LeaveRequest.find(filter)
        .populate("employeeId", "name email")
        .populate("leavePolicyId", "leaveName leaveCode")
        .sort({ appliedDate: -1 });
};

// Helper for FY extraction based on start date
const getFinancialYearFromDate = (dateString) => {
    const d = new Date(dateString);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};
