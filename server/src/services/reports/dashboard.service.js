import { Payroll } from "../../models/Payroll.model.js";

/**
 * Generates summary data for the Payroll Dashboard using MongoDB Aggregation
 */
export const getDashboardSummary = async (companyId, query = {}) => {
    const matchStage = { companyId };

    if (query.month) matchStage.payrollMonth = parseInt(query.month, 10);
    if (query.year) matchStage.payrollYear = parseInt(query.year, 10);
    if (query.payrollStatus) matchStage.status = query.payrollStatus;

    // We can't filter department efficiently in the direct match since department is on Employee model.
    // If department filter is needed, we would add a $lookup stage first.
    let pipeline = [];
    
    if (query.department) {
        pipeline.push({
            $lookup: {
                from: "employees",
                localField: "employeeId",
                foreignField: "_id",
                as: "employee"
            }
        });
        pipeline.push({ $unwind: "$employee" });
        matchStage["employee.department"] = query.department;
    }

    pipeline.push({ $match: matchStage });

    pipeline.push({
        $group: {
            _id: null,
            totalEmployeesProcessed: { $sum: 1 },
            totalGrossSalary: { $sum: "$grossSalary" },
            totalNetSalary: { $sum: "$netSalary" },
            totalDeductions: {
                $sum: {
                    $add: [
                        "$deductions.pf",
                        "$deductions.esic",
                        "$deductions.pt",
                        "$deductions.tds",
                        "$deductions.lossOfPay",
                        "$deductions.salaryAdvanceRecovery",
                        "$deductions.loanRecovery",
                        "$deductions.otherDeductions"
                    ]
                }
            },
            totalBonuses: { $sum: "$earnings.bonus" },
            totalOvertime: { $sum: "$earnings.overtime" },
            totalReimbursements: { $sum: "$earnings.reimbursement" }
        }
    });

    const result = await Payroll.aggregate(pipeline);
    const data = result[0] || {
        totalEmployeesProcessed: 0,
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalDeductions: 0,
        totalBonuses: 0,
        totalOvertime: 0,
        totalReimbursements: 0
    };

    // Total Payroll Cost = Total Gross + Employer Contributions (if modeled). 
    // In our simplified model, Gross represents the company liability before deductions.
    data.totalPayrollCost = data.totalGrossSalary;

    return data;
};
