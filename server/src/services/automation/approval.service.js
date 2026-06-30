import { transitionPayrollState } from "./payrollWorkflow.service.js";

/**
 * Orchestrates multi-level approvals.
 * In this implementation, it triggers the transition engine if the role matches required criteria.
 */
export const approvePayroll = async (companyId, payrollId, userId, userRole, notes = "") => {
    // Determine the next state based on role. 
    // E.g., HR approving moves to 'Under Review', Admin approving moves to 'Approved'.
    // For simplicity in this unified layer, we'll assume an Admin is hitting 'Approve' to finalize it.
    
    let targetState = 'Approved';
    if (userRole === 'HR') {
        targetState = 'Under Review';
    }

    return await transitionPayrollState(
        companyId, 
        payrollId, 
        targetState, 
        userId, 
        `Approved by ${userRole}. Notes: ${notes}`
    );
};

export const rejectPayroll = async (companyId, payrollId, userId, userRole, notes = "") => {
    // Rejections revert it back to 'Generated'
    return await transitionPayrollState(
        companyId, 
        payrollId, 
        'Generated', 
        userId, 
        `Rejected by ${userRole}. Reason: ${notes}`
    );
};
