/**
 * Logs audit events into the Payslip array.
 * In a strictly compliant system, this might go to a separate immutable append-only collection.
 */
export const logPayslipAudit = (payslip, action, userId) => {
    payslip.auditLogs.push({
        action,
        performedBy: userId,
        timestamp: new Date()
    });
};
