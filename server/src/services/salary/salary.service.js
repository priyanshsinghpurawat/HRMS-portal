import { SalaryStructure } from "../../models/SalaryStructure.model.js";
import { Employee } from "../../models/Employee.model.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Validates that an employee exists and belongs to the specified company.
 */
const validateEmployee = async (companyId, employeeId) => {
    const employee = await Employee.findOne({ _id: employeeId, company: companyId });
    if (!employee) {
        throw new ApiError(404, "Employee not found in this company");
    }
    return employee;
};

/**
 * Creates the initial salary structure for an employee
 */
export const createInitialSalaryStructure = async (companyId, employeeId, userId, payload) => {
    await validateEmployee(companyId, employeeId);

    const existingStructure = await SalaryStructure.findOne({ companyId, employeeId });
    if (existingStructure) {
        throw new ApiError(409, "Salary structure already exists for this employee. Use the revision API to update.");
    }

    const salary = await SalaryStructure.create({
        companyId,
        employeeId,
        createdBy: userId,
        ...payload
    });

    return salary;
};

/**
 * Retrieves the current active salary structure dynamically based on the effective date
 */
export const getCurrentSalaryStructure = async (companyId, employeeId) => {
    await validateEmployee(companyId, employeeId);

    const currentSalary = await SalaryStructure.findOne({
        companyId,
        employeeId,
        effectiveFrom: { $lte: new Date() }
    })
    .sort({ effectiveFrom: -1 })
    .limit(1);

    if (!currentSalary) {
        throw new ApiError(404, "No active salary structure found for this employee");
    }

    return currentSalary;
};

/**
 * Creates a new salary revision for an employee
 */
export const createSalaryRevision = async (companyId, employeeId, userId, payload) => {
    await validateEmployee(companyId, employeeId);

    // Ensure we don't already have a revision starting on the exact same date
    const conflictingRevision = await SalaryStructure.findOne({
        companyId,
        employeeId,
        effectiveFrom: new Date(payload.effectiveFrom)
    });

    if (conflictingRevision) {
        throw new ApiError(409, "A salary revision already exists for this exact effective date");
    }

    const revision = await SalaryStructure.create({
        companyId,
        employeeId,
        createdBy: userId,
        ...payload
    });

    return revision;
};

/**
 * Retrieves the complete salary history of an employee
 */
export const getSalaryHistory = async (companyId, employeeId) => {
    await validateEmployee(companyId, employeeId);

    const history = await SalaryStructure.find({ companyId, employeeId })
        .sort({ effectiveFrom: -1 })
        .populate("createdBy", "name email");

    return history;
};

/**
 * Retrieves the specific salary structure active on a specific target date
 * Useful for the future Payroll Engine Phase
 */
export const getSalaryStructureByDate = async (companyId, employeeId, targetDate) => {
    const salary = await SalaryStructure.findOne({
        companyId,
        employeeId,
        effectiveFrom: { $lte: new Date(targetDate) }
    })
    .sort({ effectiveFrom: -1 })
    .limit(1);

    if (!salary) {
        throw new ApiError(404, `No salary structure found active on or before ${targetDate}`);
    }

    return salary;
};
