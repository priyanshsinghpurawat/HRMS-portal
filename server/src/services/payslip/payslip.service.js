import { Payslip } from "../../models/Payslip.model.js";
import { Payroll } from "../../models/Payroll.model.js";
import { Company } from "../../models/Company.model.js";
import { Employee } from "../../models/Employee.model.js";
import { generatePayslipNumber } from "./payslipNumber.service.js";
import { logPayslipAudit } from "./payslipAudit.service.js";
import { generatePdfBuffer } from "./pdf.service.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Generates a new Payslip from a finalized Payroll Snapshot
 */
export const generatePayslip = async (companyId, userId, payrollId) => {
    // 1. Verify Payroll is eligible
    const payroll = await Payroll.findOne({ _id: payrollId, companyId });
    if (!payroll) throw new ApiError(404, "Payroll record not found");
    
    if (!['Approved', 'Locked', 'Paid'].includes(payroll.status)) {
        throw new ApiError(400, "Payslips can only be generated for Approved, Locked, or Paid payrolls.");
    }

    // 2. Prevent duplicate generation
    const existingPayslip = await Payslip.findOne({ payrollId });
    if (existingPayslip) {
        throw new ApiError(409, "A payslip has already been generated for this payroll record.");
    }

    // 3. Generate sequential Number
    const payslipNumber = await generatePayslipNumber(payroll.payrollYear, payroll.payrollMonth);

    // 4. Create immutable Payslip document
    const payslipData = {
        payrollId: payroll._id,
        employeeId: payroll.employeeId,
        companyId,
        payslipNumber,
        payrollMonth: payroll.payrollMonth,
        payrollYear: payroll.payrollYear,
        
        salarySnapshot: payroll.salarySnapshot,
        attendanceSummary: payroll.attendanceSummary,
        leaveSummary: payroll.leaveSummary || {},
        holidaySummary: payroll.holidaySummary || {},
        earnings: payroll.earnings,
        deductions: payroll.deductions,
        grossSalary: payroll.grossSalary,
        netSalary: payroll.netSalary,
        
        status: 'Generated',
        generatedBy: userId,
        auditLogs: [{
            action: 'Generated',
            performedBy: userId,
            timestamp: new Date()
        }]
    };

    const payslip = await Payslip.create(payslipData);
    return payslip;
};

/**
 * Publishes a Payslip (making it visible to employees)
 */
export const publishPayslip = async (companyId, userId, payrollId) => {
    const payslip = await Payslip.findOne({ payrollId, companyId });
    if (!payslip) throw new ApiError(404, "Payslip not found for this payroll");

    if (payslip.status === 'Published' || payslip.status === 'Downloaded') {
        throw new ApiError(400, "Payslip is already published");
    }

    payslip.status = 'Published';
    logPayslipAudit(payslip, 'Published', userId);
    await payslip.save();

    return payslip;
};

/**
 * Retrieves PDF buffer for a Payslip
 */
export const getPayslipPdf = async (companyId, userId, payslipId, isEmployee = false) => {
    const filter = { _id: payslipId };
    
    // Authorization
    if (isEmployee) filter.employeeId = userId;
    else filter.companyId = companyId;

    const payslip = await Payslip.findOne(filter);
    if (!payslip) throw new ApiError(404, "Payslip not found or unauthorized");

    if (isEmployee && payslip.status === 'Generated') {
        throw new ApiError(403, "Payslip is not yet published");
    }

    const company = await Company.findById(payslip.companyId);
    const employee = await Employee.findById(payslip.employeeId);

    const pdfBuffer = await generatePdfBuffer(payslip, company, employee);

    // Log download event
    if (payslip.status === 'Published' && isEmployee) {
        payslip.status = 'Downloaded';
    }
    logPayslipAudit(payslip, 'Downloaded PDF', userId);
    await payslip.save();

    return pdfBuffer;
};

/**
 * General querying service
 */
export const queryPayslips = async (companyId, query = {}, employeeIdFilter = null) => {
    const filter = { companyId };
    
    // If employee is fetching, lock to their ID
    if (employeeIdFilter) filter.employeeId = employeeIdFilter;
    else if (query.employeeId) filter.employeeId = query.employeeId; // HR fetching specific employee

    if (query.month) filter.payrollMonth = query.month;
    if (query.year) filter.payrollYear = query.year;
    if (query.status) filter.status = query.status;

    // Employees can only see Published or Downloaded
    if (employeeIdFilter && !query.status) {
        filter.status = { $in: ['Published', 'Downloaded'] };
    }

    return await Payslip.find(filter)
        .populate("employeeId", "name email department")
        .sort({ payrollYear: -1, payrollMonth: -1 });
};
