import { Payslip } from "../../models/Payslip.model.js";

/**
 * Generates a globally unique Payslip Number (e.g. PS-2026-07-000001)
 * In a real high-throughput system, this might use a dedicated sequence collection or Redis.
 * For this phase, we count existing records for the month and increment.
 */
export const generatePayslipNumber = async (year, month) => {
    // Format month to 2 digits
    const formattedMonth = month.toString().padStart(2, '0');
    
    // Prefix: PS-YYYY-MM-
    const prefix = `PS-${year}-${formattedMonth}-`;

    // Find the highest sequence number for this prefix
    const latestPayslip = await Payslip.findOne({
        payslipNumber: { $regex: `^${prefix}` }
    }).sort({ payslipNumber: -1 });

    let sequence = 1;
    if (latestPayslip) {
        // Extract sequence part (last 6 digits) and increment
        const parts = latestPayslip.payslipNumber.split('-');
        const lastSequence = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1;
        }
    }

    const formattedSequence = sequence.toString().padStart(6, '0');
    return `${prefix}${formattedSequence}`;
};
