import { Employee } from "../models/Employee.model.js";
import { HR } from "../models/HR.model.js";
import { User } from "../models/User.model.js";
import { Company } from "../models/Company.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTempPassword } from "../utils/RandomPassword.js";
import { sendEmployeeCredentialsEmail } from "../services/email.service.js";
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

export const createEmployee = asyncHandler(async (req, res) => {
    const { name, personalEmail, department, designation, phone, reportingManager, joiningDate } = req.body;

    if (!name || !personalEmail) {
        throw new ApiError(400, "Name and personalEmail are required");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied: Only HR accounts can create employees");
    }

    const company = await Company.findById(hr.company);
    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    // Check if personal email is already registered
    const existedUser = await User.findOne({ personalEmail });
    if (existedUser) {
        throw new ApiError(400, "User with this personal email already exists");
    }

    // Generate credentials
    const tempPassword = generateTempPassword();
    const sanitizedEmpName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const sanitizedCompanyName = company.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    let email = `emp.${sanitizedEmpName}@${sanitizedCompanyName}.company`;
    let counter = 1;
    while (await User.findOne({ email })) {
        email = `emp.${sanitizedEmpName}${counter}@${sanitizedCompanyName}.company`;
        counter++;
    }

    // Generate unique employee ID
    const count = await Employee.countDocuments({ company: company._id });
    let employeeId = `EMP-${sanitizedCompanyName.toUpperCase()}-${String(count + 1).padStart(4, "0")}`;
    let idCounter = 1;
    while (await Employee.findOne({ employeeId })) {
        employeeId = `EMP-${sanitizedCompanyName.toUpperCase()}-${String(count + 1 + idCounter).padStart(4, "0")}`;
        idCounter++;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    let employeeUser;
    let employeeProfile;
    try {
        const [createdUser] = await User.create(
            [
                {
                    name,
                    email,
                    personalEmail,
                    password: tempPassword,
                    role: "employee",
                    mustChangePassword: true
                }
            ],
            { session }
        );

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while creating employee user account");
        }

        employeeUser = createdUser;

        const [createdEmployee] = await Employee.create(
            [
                {
                    user: employeeUser._id,
                    company: company._id,
                    employeeId,
                    personalEmail,
                    companyEmail: email,
                    department: department || "Engineering",
                    designation: designation || "Software Engineer",
                    phone: phone || "",
                    reportingManager: reportingManager || null,
                    joiningDate: joiningDate || new Date(),
                    employmentStatus: "active"
                }
            ],
            { session }
        );

        if (!createdEmployee) {
            throw new ApiError(500, "Something went wrong while creating employee profile");
        }

        employeeProfile = createdEmployee;

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    // Send credentials email
    await sendEmployeeCredentialsEmail({
        personalEmail,
        name,
        companyName: company.name,
        department: employeeProfile.department,
        designation: employeeProfile.designation,
        loginEmail: email,
        tempPassword
    });

    return res.status(201).json(new ApiResponse(201, employeeProfile, "Employee created successfully and credentials sent to personal email"));
});

export const activateEmployee = asyncHandler(async (req, res) => {
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

    employee.employmentStatus = "active";
    await employee.save();

    return res.status(200).json(new ApiResponse(200, employee, "Employee activated successfully"));
});

export const deleteEmployee = asyncHandler(async (req, res) => {
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
        throw new ApiError(403, "Access Denied: You cannot delete records of another company's employees");
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await User.findByIdAndDelete(employee.user).session(session);
        await Employee.findByIdAndDelete(employee._id).session(session);
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    return res.status(200).json(new ApiResponse(200, null, "Employee record deleted successfully"));
});
