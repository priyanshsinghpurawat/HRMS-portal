import mongoose from "mongoose";
import { Payroll } from "../../models/Payroll.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { logWorkflowAudit } from "./audit.service.js";
import { notifyPayrollEvent } from "./notification.service.js";

const VALID_TRANSITIONS = {
    'Draft': ['Generated'],
    'Generated': ['Under Review', 'Approved'],
    'Under Review': ['Approved', 'Generated'], // Can revert to generated if rejected
    'Approved': ['Locked'],
    'Locked': ['Payslip Generated', 'Generated'], // Unlock reverting to Generated
    'Payslip Generated': ['Published'],
    'Published': ['Salary Released'],
    'Salary Released': ['Completed'],
    'Completed': [] // Terminal state
};

/**
 * Validates and executes a state machine transition for a Payroll record.
 * Must be executed atomically.
 */
export const transitionPayrollState = async (companyId, payrollId, newState, userId, notes = "") => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payroll = await Payroll.findOne({ _id: payrollId, companyId }).session(session);
        
        if (!payroll) {
            throw new ApiError(404, "Payroll record not found");
        }

        const currentState = payroll.status;

        // Verify valid state transition
        const allowedNextStates = VALID_TRANSITIONS[currentState];
        if (!allowedNextStates || !allowedNextStates.includes(newState)) {
            throw new ApiError(400, `Invalid workflow transition from ${currentState} to ${newState}`);
        }

        payroll.status = newState;
        await payroll.save({ session });

        // Record immutable audit log
        await logWorkflowAudit(
            companyId,
            payrollId,
            `State Transition: ${newState}`,
            userId,
            currentState,
            newState,
            notes
        );

        await session.commitTransaction();

        // Async Background Notifications (non-blocking)
        if (newState === 'Under Review') notifyPayrollEvent('ADMIN', 'APPROVAL_REQUIRED', { payrollId });
        if (newState === 'Salary Released') notifyPayrollEvent('EMPLOYEE', 'SALARY_RELEASED', { payrollId });

        return payroll;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Locks an entire payroll cycle for a month/year
 */
export const lockPayrollCycle = async (companyId, month, year, userId) => {
    // Find all Approved payrolls for the cycle
    const payrolls = await Payroll.find({
        companyId,
        payrollMonth: month,
        payrollYear: year,
        status: 'Approved'
    });

    const results = { locked: 0, failed: 0 };

    // In a production system, this could be pushed to a queue. Here we iterate sequentially.
    for (const payroll of payrolls) {
        try {
            await transitionPayrollState(companyId, payroll._id, 'Locked', userId, 'Bulk Cycle Lock');
            results.locked++;
        } catch (error) {
            results.failed++;
        }
    }

    return results;
};
