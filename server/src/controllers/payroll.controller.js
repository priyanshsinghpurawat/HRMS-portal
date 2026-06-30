import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateEmployeePayroll } from "../services/payroll/payrollEngine.service.js";
import { updatePayrollStatus } from "../services/payroll/payrollSnapshot.service.js";
import { Payroll } from "../models/Payroll.model.js";
import { Employee } from "../models/Employee.model.js";
import { ApiError } from "../utils/ApiError.js";

export const generatePayroll = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const { employeeId, month, year, additionalEarnings, additionalDeductions } = req.body;

    const payroll = await generateEmployeePayroll(
        companyId, 
        userId, 
        employeeId, 
        month, 
        year, 
        additionalEarnings, 
        additionalDeductions
    );

    return res.status(201).json(new ApiResponse(201, payroll, "Payroll generated successfully"));
});

export const bulkGeneratePayroll = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const { month, year, department, employeeIds } = req.body;

    let targetEmployees = [];

    if (employeeIds && employeeIds.length > 0) {
        targetEmployees = await Employee.find({ _id: { $in: employeeIds }, companyId });
    } else {
        const filter = { company: companyId, employmentStatus: "active" };
        if (department) filter.department = department;
        targetEmployees = await Employee.find(filter);
    }

    if (targetEmployees.length === 0) {
        throw new ApiError(404, "No eligible employees found for payroll generation.");
    }

    const results = { successful: 0, failed: 0, errors: [] };

    // In a real high-volume production system, this would be pushed to a queue (like BullMQ).
    // For this phase, we await them in a loop or Promise.allSettled.
    for (const emp of targetEmployees) {
        try {
            await generateEmployeePayroll(companyId, userId, emp._id, month, year);
            results.successful++;
        } catch (error) {
            results.failed++;
            results.errors.push({ employeeId: emp._id, error: error.message });
        }
    }

    return res.status(200).json(new ApiResponse(200, results, "Bulk payroll generation completed"));
});

export const getPayrolls = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { month, year, employeeId, payrollStatus } = req.query;

    const filter = { companyId };
    if (month) filter.payrollMonth = month;
    if (year) filter.payrollYear = year;
    if (employeeId) filter.employeeId = employeeId;
    if (payrollStatus) filter.status = payrollStatus;

    const payrolls = await Payroll.find(filter)
        .populate("employeeId", "name email department")
        .sort({ payrollYear: -1, payrollMonth: -1 });

    return res.status(200).json(new ApiResponse(200, payrolls, "Payrolls retrieved successfully"));
});

export const getPayrollById = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { payrollId } = req.params;

    const payroll = await Payroll.findOne({ _id: payrollId, companyId })
        .populate("employeeId")
        .populate("generatedBy", "name email");

    if (!payroll) {
        throw new ApiError(404, "Payroll record not found");
    }

    return res.status(200).json(new ApiResponse(200, payroll, "Payroll retrieved successfully"));
});

export const updateStatus = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { payrollId } = req.params;
    const { status } = req.body;

    const payroll = await updatePayrollStatus(companyId, payrollId, status);
    return res.status(200).json(new ApiResponse(200, payroll, `Payroll status updated to ${status}`));
});
