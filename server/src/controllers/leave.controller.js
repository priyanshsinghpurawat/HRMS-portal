import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as leavePolicyService from "../services/leave/leavePolicy.service.js";
import * as leaveBalanceService from "../services/leave/leaveBalance.service.js";
import * as leaveRequestService from "../services/leave/leaveRequest.service.js";
import * as leaveApprovalService from "../services/leave/leaveApproval.service.js";

// --- Company / Policy Controllers ---

export const createPolicy = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const policy = await leavePolicyService.createLeavePolicy(companyId, req.body);
    return res.status(201).json(new ApiResponse(201, policy, "Leave Policy created successfully"));
});

export const updatePolicy = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { policyId } = req.params;
    const policy = await leavePolicyService.updateLeavePolicy(companyId, policyId, req.body);
    return res.status(200).json(new ApiResponse(200, policy, "Leave Policy updated (new version created) successfully"));
});

export const getPolicies = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const policies = await leavePolicyService.getActiveLeavePolicies(companyId);
    return res.status(200).json(new ApiResponse(200, policies, "Active Leave Policies retrieved successfully"));
});


// --- HR Management Controllers ---

export const getAllLeaves = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const leaves = await leaveApprovalService.getAllCompanyLeaves(companyId, req.query);
    return res.status(200).json(new ApiResponse(200, leaves, "Company leaves retrieved successfully"));
});

export const approveRejectLeave = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const hrId = req.user._id;
    const { leaveId } = req.params;
    const { action, remarks } = req.body;

    const request = await leaveApprovalService.processLeaveApproval(companyId, hrId, leaveId, action, remarks);
    return res.status(200).json(new ApiResponse(200, request, `Leave request ${action.toLowerCase()} successfully`));
});

export const getEmployeeBalance = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { employeeId } = req.params;
    
    // Default to current FY if not provided in query
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const defaultFy = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    
    const fy = req.query.financialYear || defaultFy;

    const balances = await leaveBalanceService.getEmployeeLeaveBalances(companyId, employeeId, fy);
    return res.status(200).json(new ApiResponse(200, balances, "Employee leave balances retrieved successfully"));
});


// --- Employee Leave Controllers ---

export const applyForLeave = asyncHandler(async (req, res) => {
    // Assuming req.user is an Employee for this route. 
    // In our architecture, the employee's ID might be req.user._id, and company on req.user.company
    // To keep it standard with existing APIs:
    const employeeId = req.user._id;
    const companyId = req.user.companyId || req.user.company; // fallback for how employee model handles it

    const request = await leaveRequestService.submitLeaveRequest(companyId, employeeId, req.body);
    return res.status(201).json(new ApiResponse(201, request, "Leave request submitted successfully"));
});

export const getMyLeaves = asyncHandler(async (req, res) => {
    const employeeId = req.user._id;
    const companyId = req.user.companyId || req.user.company;

    const requests = await leaveRequestService.getEmployeeLeaveRequests(companyId, employeeId);
    return res.status(200).json(new ApiResponse(200, requests, "Your leave requests retrieved successfully"));
});

export const cancelMyLeave = asyncHandler(async (req, res) => {
    const employeeId = req.user._id;
    const companyId = req.user.companyId || req.user.company;
    const { leaveId } = req.params;

    const request = await leaveRequestService.cancelPendingLeaveRequest(companyId, employeeId, leaveId);
    return res.status(200).json(new ApiResponse(200, request, "Leave request cancelled successfully"));
});
