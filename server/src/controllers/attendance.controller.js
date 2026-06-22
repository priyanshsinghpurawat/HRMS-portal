import { Attendance } from "../models/Attendance.model.js";
import { Geofence } from "../models/Geofence.model.js";
import { Employee } from "../models/Employee.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getStartOfDay } from "../utils/startOfDay.js";
import { calculateHours } from "../utils/calculateHours.js";
import { isWithinGeofence } from "../services/location.service.js";

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
