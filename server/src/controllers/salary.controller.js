import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as salaryService from "../services/salary/salary.service.js";

/**
 * Creates the initial salary structure for an employee
 */
export const createSalary = asyncHandler(async (req, res) => {
    // Assuming auth middleware populates req.user with companyId (from previous setup, or using req.user._id if COMPANY role)
    const companyId = req.user.companyId || req.user._id; 
    const { employeeId } = req.params;
    const userId = req.user._id;

    const salary = await salaryService.createInitialSalaryStructure(companyId, employeeId, userId, req.body);
    
    return res.status(201).json(
        new ApiResponse(201, salary, "Initial salary structure created successfully")
    );
});

/**
 * Retrieves the current active salary structure for an employee
 */
export const getCurrentSalary = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id; 
    const { employeeId } = req.params;

    const salary = await salaryService.getCurrentSalaryStructure(companyId, employeeId);

    return res.status(200).json(
        new ApiResponse(200, salary, "Current salary structure retrieved successfully")
    );
});

/**
 * Creates a new salary revision for an employee
 */
export const createRevision = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id; 
    const { employeeId } = req.params;
    const userId = req.user._id;

    const revision = await salaryService.createSalaryRevision(companyId, employeeId, userId, req.body);

    return res.status(201).json(
        new ApiResponse(201, revision, "Salary revision created successfully")
    );
});

/**
 * Retrieves the complete salary history of an employee
 */
export const getHistory = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id; 
    const { employeeId } = req.params;

    const history = await salaryService.getSalaryHistory(companyId, employeeId);

    return res.status(200).json(
        new ApiResponse(200, history, "Salary history retrieved successfully")
    );
});
