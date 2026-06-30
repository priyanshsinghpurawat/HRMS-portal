import { Payroll } from "../../models/Payroll.model.js";

/**
 * Generates Statutory reports by mapping the deductions from Payroll records
 */
export const getStatutoryReport = async (companyId, statutoryType, query = {}) => {
    const filter = { companyId };
    
    // Default to the most recent closed month if not provided
    if (query.month) filter.payrollMonth = parseInt(query.month, 10);
    if (query.year) filter.payrollYear = parseInt(query.year, 10);
    
    // Only report on finalized payrolls
    filter.status = { $in: ['Approved', 'Locked', 'Paid'] };

    const payrolls = await Payroll.find(filter).populate("employeeId", "name employeeId panNumber uanNumber");

    return payrolls.map(p => {
        const amount = p.deductions[statutoryType] || 0;
        
        // Return structured data for the specific tax
        return {
            payrollId: p._id,
            employeeName: p.employeeId?.name,
            employeeCode: p.employeeId?.employeeId,
            period: `${p.payrollMonth}/${p.payrollYear}`,
            grossSalary: p.grossSalary,
            deductionAmount: amount,
            // Depending on type, company contribution might be mapped here.
            // Example: PF has employer contribution which could be read from p.salarySnapshot
            companyContribution: statutoryType === 'pf' ? amount : 0, 
            totalRemittance: statutoryType === 'pf' ? amount * 2 : amount
        };
    }).filter(record => record.deductionAmount > 0); // Only include employees who actually had the deduction
};
