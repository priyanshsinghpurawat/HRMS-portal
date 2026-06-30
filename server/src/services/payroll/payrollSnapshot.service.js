import mongoose from "mongoose";
import { Payroll } from "../../models/Payroll.model.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Creates the immutable Payroll document wrapped in a MongoDB Transaction
 */
export const createPayrollSnapshot = async (payrollData) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Prevent duplicate generation for the same period
        const existing = await Payroll.findOne({
            companyId: payrollData.companyId,
            employeeId: payrollData.employeeId,
            payrollMonth: payrollData.payrollMonth,
            payrollYear: payrollData.payrollYear
        }).session(session);

        if (existing) {
            throw new ApiError(409, "Payroll already generated for this employee in the specified period.");
        }

        const [payroll] = await Payroll.create([payrollData], { session });

        await session.commitTransaction();
        return payroll;
    } catch (error) {
        await session.abortTransaction();
        throw error; // Re-throw to be caught by asyncHandler
    } finally {
        session.endSession();
    }
};

/**
 * Updates Payroll status (e.g., Draft -> Locked) wrapped in a Transaction
 */
export const updatePayrollStatus = async (companyId, payrollId, newStatus) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payroll = await Payroll.findOne({ _id: payrollId, companyId }).session(session);
        
        if (!payroll) {
            throw new ApiError(404, "Payroll record not found");
        }

        // State Machine validation
        if (payroll.status === 'Locked' && newStatus !== 'Paid') {
            throw new ApiError(400, "Locked payrolls cannot be modified unless marking as Paid.");
        }
        
        if (payroll.status === 'Paid') {
            throw new ApiError(400, "Paid payrolls are permanently finalized.");
        }

        payroll.status = newStatus;
        await payroll.save({ session });

        await session.commitTransaction();
        return payroll;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
