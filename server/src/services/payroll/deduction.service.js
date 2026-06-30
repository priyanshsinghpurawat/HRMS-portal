/**
 * Deduction Service: Handles statutory and additional deductions
 */

export const calculateStatutoryDeductions = (grossSalary, basicSalary, taxConfig) => {
    let pf = 0;
    let esic = 0;
    let pt = 0;
    let tds = 0;

    if (taxConfig?.pf?.enabled) {
        const pfPercent = taxConfig.pf.employeeContribution || 12;
        pf = (basicSalary * pfPercent) / 100;
    }

    if (taxConfig?.esic?.enabled) {
        if (grossSalary <= 21000) {
            const esicPercent = taxConfig.esic.employeeContribution || 0.75;
            esic = (grossSalary * esicPercent) / 100;
        }
    }

    if (taxConfig?.pt?.enabled) {
        if (grossSalary > 15000) pt = 200;
        else if (grossSalary > 10000) pt = 150;
    }

    if (taxConfig?.tds?.enabled) {
        tds = 0; // TDS requires complex tax regimes, default 0
    }

    return {
        pf: Math.round(pf),
        esic: Math.round(esic),
        pt: Math.round(pt),
        tds: Math.round(tds),
        totalStatutory: Math.round(pf + esic + pt + tds)
    };
};

export const calculateAdditionalDeductions = (dailySalary, unpaidDays, manualDeductions = {}) => {
    const lossOfPay = Math.round(dailySalary * unpaidDays);
    
    const salaryAdvanceRecovery = manualDeductions.salaryAdvanceRecovery || 0;
    const loanRecovery = manualDeductions.loanRecovery || 0;
    const otherDeductions = manualDeductions.otherDeductions || 0;

    return {
        lossOfPay,
        salaryAdvanceRecovery,
        loanRecovery,
        otherDeductions,
        totalAdditional: lossOfPay + salaryAdvanceRecovery + loanRecovery + otherDeductions
    };
};
