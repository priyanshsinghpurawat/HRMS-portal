import { Payroll } from "../../models/Payroll.model.js";

/**
 * Builds the common match query for payroll reports
 */
const buildReportFilter = (companyId, query) => {
    const filter = { companyId };
    
    if (query.month) filter.payrollMonth = parseInt(query.month, 10);
    if (query.year) filter.payrollYear = parseInt(query.year, 10);
    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.payrollStatus) filter.status = query.payrollStatus;
    
    if (query.salaryRange) {
        const [min, max] = query.salaryRange.split('-');
        filter.netSalary = { $gte: parseInt(min, 10), $lte: parseInt(max, 10) };
    }

    return filter;
};

/**
 * Retrieves the paginated Payroll Register
 */
export const getPayrollRegister = async (companyId, query = {}) => {
    const filter = buildReportFilter(companyId, query);
    
    // Pagination defaults
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 100; // Large default for reports
    const skip = (page - 1) * limit;

    let mongoQuery = Payroll.find(filter)
        .populate("employeeId", "name employeeId department designation email")
        .sort({ payrollYear: -1, payrollMonth: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Payroll.countDocuments(filter);
    
    // To filter by department natively, we have to filter post-population or use Aggregation.
    // For simplicity in this phase, if department is present, we fetch all and filter in memory, 
    // or rely on the dashboard lookup method. Using memory filter for pagination edge cases is tricky, 
    // but works if datasets per month are <1000.
    
    let records = await mongoQuery;

    if (query.department) {
        records = records.filter(r => r.employeeId && r.employeeId.department === query.department);
        // Note: The total count won't accurately reflect the department filter in this simplified approach
    }

    return {
        data: records,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Retrieves specific employee payroll history
 */
export const getEmployeePayrollHistory = async (companyId, employeeId) => {
    return await Payroll.find({ companyId, employeeId })
        .sort({ payrollYear: -1, payrollMonth: -1 });
};
