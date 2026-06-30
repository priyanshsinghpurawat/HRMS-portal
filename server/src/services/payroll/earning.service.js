/**
 * Earning Service: Handles additional earnings
 */

export const calculateAdditionalEarnings = (manualEarnings = {}) => {
    const bonus = manualEarnings.bonus || 0;
    const incentive = manualEarnings.incentive || 0;
    const overtime = manualEarnings.overtime || 0;
    const reimbursement = manualEarnings.reimbursement || 0;
    const arrears = manualEarnings.arrears || 0;
    const otherEarnings = manualEarnings.otherEarnings || 0;

    return {
        bonus,
        incentive,
        overtime,
        reimbursement,
        arrears,
        otherEarnings,
        totalAdditional: bonus + incentive + overtime + reimbursement + arrears + otherEarnings
    };
};
