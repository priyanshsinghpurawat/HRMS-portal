import { Employee } from "../models/Employee.model.js";
import { HR } from "../models/HR.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// ==========================================
// HR Endpoints (HR role checks applied at route)
// ==========================================

export const getEmployees = asyncHandler(async (req, res) => {
    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied: Only HR accounts can retrieve employees catalog");
    }

    const employees = await Employee.find({ company: hr.company })
        .populate("user", "name email phone role accountStatus")
        .populate("reportingManager", "employeeId department designation");

    return res.status(200).json(new ApiResponse(200, employees, "Company employees list fetched successfully"));
});

export const getEmployeeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Employee ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied");
    }

    const employee = await Employee.findById(id)
        .populate("user", "name email phone role accountStatus")
        .populate("reportingManager", "employeeId department designation");

    if (!employee) {
        throw new ApiError(404, "Employee record not found");
    }

    // Security check: HR must match employee's company
    if (employee.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot view records of another company's employees");
    }

    return res.status(200).json(new ApiResponse(200, employee, "Employee record retrieved successfully"));
});

export const updateEmployeeHR = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Employee ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied");
    }

    const employee = await Employee.findById(id);
    if (!employee) {
        throw new ApiError(404, "Employee record not found");
    }

    if (employee.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot edit records of another company's employees");
    }

    const allowedUpdates = ["department", "designation", "reportingManager"];
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            employee[key] = req.body[key];
        }
    }

    await employee.save();

    return res.status(200).json(new ApiResponse(200, employee, "Employee record updated successfully by HR"));
});

export const deactivateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Employee ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied");
    }

    const employee = await Employee.findById(id);
    if (!employee) {
        throw new ApiError(404, "Employee record not found");
    }

    if (employee.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot modify records of another company's employees");
    }

    employee.employmentStatus = "inactive";
    await employee.save();

    return res.status(200).json(new ApiResponse(200, employee, "Employee deactivated successfully"));
});

export const terminateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Employee ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied");
    }

    const employee = await Employee.findById(id);
    if (!employee) {
        throw new ApiError(404, "Employee record not found");
    }

    if (employee.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot modify records of another company's employees");
    }

    employee.employmentStatus = "terminated";
    await employee.save();

    return res.status(200).json(new ApiResponse(200, employee, "Employee terminated successfully"));
});

// ==========================================
// Employee Self Endpoints
// ==========================================

export const getEmployeeProfile = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({ user: req.user._id })
        .populate("user", "name email phone role accountStatus")
        .populate("company", "name logo website");

    if (!employee) {
        throw new ApiError(404, "Employee profile not found");
    }

    return res.status(200).json(new ApiResponse(200, employee, "Employee self profile fetched successfully"));
});

export const updateEmployeeProfile = asyncHandler(async (req, res) => {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
        throw new ApiError(404, "Employee profile not found");
    }

    const allowedSelfUpdates = ["phone", "address", "emergencyContact"];
    for (const key of allowedSelfUpdates) {
        if (req.body[key] !== undefined) {
            employee[key] = req.body[key];
        }
    }

    await employee.save();

    return res.status(200).json(new ApiResponse(200, employee, "Employee profile details updated successfully"));
});
