import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { scheduleCompanyPayroll } from "../services/automation/scheduler.service.js";
import { transitionPayrollState, lockPayrollCycle } from "../services/automation/payrollWorkflow.service.js";
import { approvePayroll, rejectPayroll } from "../services/automation/approval.service.js";
import { getPayrollAuditHistory } from "../services/automation/audit.service.js";

// --- Scheduler Controllers ---

export const updatePayrollSchedule = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { runOnDay } = req.body;
    
    // Minimal demonstration of interacting with the scheduler service
    const schedule = scheduleCompanyPayroll(companyId, runOnDay);
    
    return res.status(200).json(new ApiResponse(200, schedule, "Payroll schedule updated successfully"));
});

// --- Workflow Controllers ---

export const updateStatus = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const { payrollId } = req.params;
    const { status, notes } = req.body;

    const payroll = await transitionPayrollState(companyId, payrollId, status, userId, notes);
    return res.status(200).json(new ApiResponse(200, payroll, `Payroll status transitioned to ${status}`));
});

export const approve = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { payrollId } = req.params;
    const { notes } = req.body;

    const payroll = await approvePayroll(companyId, payrollId, userId, userRole, notes);
    return res.status(200).json(new ApiResponse(200, payroll, "Payroll approved successfully"));
});

export const reject = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { payrollId } = req.params;
    const { notes } = req.body;

    const payroll = await rejectPayroll(companyId, payrollId, userId, userRole, notes);
    return res.status(200).json(new ApiResponse(200, payroll, "Payroll rejected successfully"));
});

export const lock = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const { payrollId } = req.params;
    const { notes } = req.body;

    const payroll = await transitionPayrollState(companyId, payrollId, 'Locked', userId, notes);
    return res.status(200).json(new ApiResponse(200, payroll, "Payroll locked successfully"));
});

export const unlock = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const { payrollId } = req.params;
    const { notes } = req.body;

    const payroll = await transitionPayrollState(companyId, payrollId, 'Generated', userId, `Unlocked by admin. Notes: ${notes}`);
    return res.status(200).json(new ApiResponse(200, payroll, "Payroll unlocked successfully"));
});

export const getAuditLogs = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { payrollId } = req.query;

    const logs = await getPayrollAuditHistory(companyId, payrollId);
    return res.status(200).json(new ApiResponse(200, logs, "Audit logs retrieved successfully"));
});

// Notifications
export const getNotifications = asyncHandler(async (req, res) => {
    // Return empty array for now since we simulated notification dispatching in memory
    return res.status(200).json(new ApiResponse(200, [], "Notifications retrieved successfully"));
});
