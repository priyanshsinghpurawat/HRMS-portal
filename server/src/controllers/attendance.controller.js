import { Attendance } from "../models/Attendance.model.js";
import { Geofence } from "../models/Geofence.model.js";
import { Employee } from "../models/Employee.model.js";
import { CorrectionRequest } from "../models/CorrectionRequest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getStartOfDay } from "../utils/startOfDay.js";
import { calculateHours } from "../utils/calculateHours.js";
import { isWithinGeofence } from "../services/location.service.js";
import * as attendanceService from "../services/attendance/attendance.service.js";

// @desc    Check-in Employee
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
export const checkIn = asyncHandler(async (req, res) => {
    const { latitude, longitude, deviceInfo, branchName } = req.body;
    const employeeId = req.user._id;

    if (!latitude || !longitude || !branchName) {
        throw new ApiError(400, "Latitude, longitude, and branchName are required");
    }

    const employee = await Employee.findOne({ user: employeeId });
    if (!employee) throw new ApiError(404, "Employee profile not found");

    const today = getStartOfDay();
    
    // Check if already checked in today
    let attendance = await Attendance.findOne({ employeeId, date: today });
    if (attendance && attendance.checkIn && attendance.checkIn.time) {
        throw new ApiError(400, "Already checked in today");
    }

    // Validate Geofence
    const geofence = await Geofence.findOne({ companyId: employee.company, branchName, isActive: true });
    if (!geofence) {
        throw new ApiError(404, "Active geofence not found for this branch");
    }

    const isValidLocation = isWithinGeofence(latitude, longitude, geofence);
    if (!isValidLocation) {
        throw new ApiError(403, "Check-in failed. You are outside the allowed office area.");
    }

    // Create or update attendance record
    const checkInData = {
        time: new Date(),
        location: { type: "Point", coordinates: [longitude, latitude] },
        deviceInfo,
        isVerified: true
    };

    if (attendance) {
        attendance.checkIn = checkInData;
        attendance.status = "Present";
        await attendance.save();
    } else {
        attendance = await Attendance.create({
            employeeId,
            companyId: employee.company,
            date: today,
            checkIn: checkInData,
            status: "Present"
        });
    }

    return res.status(200).json(new ApiResponse(200, attendance, "Checked in successfully"));
});

// @desc    Check-out Employee
// @route   POST /api/attendance/check-out
// @access  Private (Employee)
export const checkOut = asyncHandler(async (req, res) => {
    const { latitude, longitude, deviceInfo } = req.body;
    const employeeId = req.user._id;

    const today = getStartOfDay();
    let attendance = await Attendance.findOne({ employeeId, date: today });

    if (!attendance || !attendance.checkIn || !attendance.checkIn.time) {
        throw new ApiError(400, "Cannot check out. No check-in record found for today.");
    }

    if (attendance.checkOut && attendance.checkOut.time) {
        throw new ApiError(400, "Already checked out today");
    }

    attendance.checkOut = {
        time: new Date(),
        location: latitude && longitude ? { type: "Point", coordinates: [longitude, latitude] } : undefined,
        deviceInfo
    };

    // Calculate total hours
    attendance.totalHours = calculateHours(attendance.checkIn.time, attendance.checkOut.time);
    await attendance.save();

    return res.status(200).json(new ApiResponse(200, attendance, "Checked out successfully"));
});

// @desc    Get Today's Attendance for Employee
// @route   GET /api/attendance/me/today
// @access  Private (Employee)
export const getMyTodayAttendance = asyncHandler(async (req, res) => {
    const today = getStartOfDay();
    const attendance = await Attendance.findOne({ employeeId: req.user._id, date: today });

    return res.status(200).json(new ApiResponse(200, attendance || null, "Attendance retrieved"));
});

// @desc    Request Leave
// @route   POST /api/attendance/leave
// @access  Private (Employee)
export const requestLeave = asyncHandler(async (req, res) => {
    const { date, reason } = req.body;
    const employeeId = req.user._id;

    if (!date || !reason) {
        throw new ApiError(400, "Date and reason are required");
    }

    const leaveRequest = await CorrectionRequest.create({
        employeeId,
        date: new Date(date),
        requestType: "Leave",
        reason,
        status: "Pending"
    });

    return res.status(201).json(new ApiResponse(201, leaveRequest, "Leave request submitted successfully"));
});

// @desc    Get Leave/Correction Requests (For HR/Admin)
// @route   GET /api/attendance/leaves
// @access  Private (HR/Admin)
export const getLeaveRequests = asyncHandler(async (req, res) => {
    // Retrieve all leave requests (could filter by company if strictly HR)
    const requests = await CorrectionRequest.find({ requestType: "Leave" }).populate("employeeId", "name email");

    return res.status(200).json(new ApiResponse(200, requests, "Leave requests retrieved"));
});

// @desc    Approve/Reject Leave Request
// @route   PUT /api/attendance/leave/:id
// @access  Private (HR/Admin)
export const updateLeaveStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, hrComment } = req.body; // status: 'Approved' | 'Rejected'
    const hrId = req.user._id;

    if (!['Approved', 'Rejected'].includes(status)) {
        throw new ApiError(400, "Invalid status. Must be 'Approved' or 'Rejected'");
    }

    const leaveRequest = await CorrectionRequest.findById(id);
    if (!leaveRequest) {
        throw new ApiError(404, "Leave request not found");
    }

    leaveRequest.status = status;
    leaveRequest.resolvedBy = hrId;
    if (hrComment) leaveRequest.hrComment = hrComment;

    await leaveRequest.save();

    // If approved, create or update the Attendance record as Leave
    if (status === 'Approved' && leaveRequest.requestType === 'Leave') {
        const employee = await Employee.findOne({ user: leaveRequest.employeeId });
        const normalizedDate = getStartOfDay(leaveRequest.date);

        let attendance = await Attendance.findOne({ employeeId: leaveRequest.employeeId, date: normalizedDate });

        if (attendance) {
            attendance.status = "Leave";
            attendance.auditLogs.push({
                action: "Marked Leave",
                modifiedBy: hrId,
                timestamp: new Date(),
                reason: "Leave request approved"
            });
            await attendance.save();
        } else {
            if (employee) {
                await Attendance.create({
                    employeeId: leaveRequest.employeeId,
                    companyId: employee.company,
                    date: normalizedDate,
                    status: "Leave",
                    auditLogs: [{
                        action: "Marked Leave",
                        modifiedBy: hrId,
                        timestamp: new Date(),
                        reason: "Leave request approved"
                    }]
                });
            }
        }
    }

    return res.status(200).json(new ApiResponse(200, leaveRequest, `Leave request ${status.toLowerCase()}`));
});

// --- HR Management APIs ---

// @desc    HR Manually Marks Attendance
// @route   POST /api/company/attendance
// @access  Private (HR/Company)
export const hrMarkRecord = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const hrId = req.user._id;

    const attendance = await attendanceService.hrMarkAttendance(companyId, hrId, req.body);
    
    return res.status(201).json(new ApiResponse(201, attendance, "Attendance marked successfully"));
});

// @desc    HR Updates Attendance
// @route   PATCH /api/company/attendance/:attendanceId
// @access  Private (HR/Company)
export const hrUpdateRecord = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const hrId = req.user._id;
    const { attendanceId } = req.params;

    const attendance = await attendanceService.hrUpdateAttendance(companyId, hrId, attendanceId, req.body);
    
    return res.status(200).json(new ApiResponse(200, attendance, "Attendance updated successfully"));
});

// @desc    HR Gets Single Attendance Record
// @route   GET /api/company/attendance/:attendanceId
// @access  Private (HR/Company)
export const hrGetRecord = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { attendanceId } = req.params;

    const attendance = await attendanceService.hrGetAttendanceById(companyId, attendanceId);
    
    return res.status(200).json(new ApiResponse(200, attendance, "Attendance retrieved successfully"));
});

// @desc    HR Queries Attendance Records
// @route   GET /api/company/attendance
// @access  Private (HR/Company)
export const hrQueryRecords = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;

    const records = await attendanceService.hrQueryAttendance(companyId, req.query);
    
    return res.status(200).json(new ApiResponse(200, records, "Attendance records retrieved successfully"));
});

// @desc    HR Bulk Marks Attendance
// @route   POST /api/company/attendance/bulk
// @access  Private (HR/Company)
export const hrBulkRecords = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const hrId = req.user._id;

    const result = await attendanceService.hrBulkMarkAttendance(companyId, hrId, req.body.records);
    
    return res.status(201).json(new ApiResponse(201, result, "Bulk attendance processed successfully"));
});
