import { Attendance } from "../../models/Attendance.model.js";
import { getStartOfDay } from "../../utils/startOfDay.js";
import { calculateHours } from "../../utils/calculateHours.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * HR Marks Attendance Manually
 */
export const hrMarkAttendance = async (companyId, hrId, payload) => {
    const date = getStartOfDay(new Date(payload.date));

    // Check for duplicate
    const existing = await Attendance.findOne({ employeeId: payload.employeeId, date });
    if (existing) {
        throw new ApiError(409, "Attendance record already exists for this date. Use update API instead.");
    }

    const checkIn = payload.checkInTime ? { time: new Date(payload.checkInTime) } : undefined;
    const checkOut = payload.checkOutTime ? { time: new Date(payload.checkOutTime) } : undefined;

    let totalHours = 0;
    if (checkIn && checkOut) {
        totalHours = calculateHours(checkIn.time, checkOut.time);
    }

    const attendance = await Attendance.create({
        companyId,
        employeeId: payload.employeeId,
        date,
        checkIn,
        checkOut,
        status: payload.status,
        attendanceSource: payload.attendanceSource || "HR",
        notes: payload.notes,
        markedBy: hrId,
        totalHours,
        auditLogs: [{
            action: 'Approved Correction', // Or 'Marked Leave' depending on context, using existing enums
            modifiedBy: hrId,
            timestamp: new Date(),
            reason: "Manual entry by HR"
        }]
    });

    return attendance;
};

/**
 * HR Updates an Existing Attendance Record
 */
export const hrUpdateAttendance = async (companyId, hrId, attendanceId, payload) => {
    const attendance = await Attendance.findOne({ _id: attendanceId, companyId });
    if (!attendance) {
        throw new ApiError(404, "Attendance record not found");
    }

    // Preserve existing checkIn/checkOut location metadata while updating time
    if (payload.checkInTime !== undefined) {
        if (!attendance.checkIn) attendance.checkIn = {};
        attendance.checkIn.time = payload.checkInTime ? new Date(payload.checkInTime) : undefined;
    }
    
    if (payload.checkOutTime !== undefined) {
        if (!attendance.checkOut) attendance.checkOut = {};
        attendance.checkOut.time = payload.checkOutTime ? new Date(payload.checkOutTime) : undefined;
    }

    if (payload.status !== undefined) attendance.status = payload.status;
    if (payload.attendanceSource !== undefined) attendance.attendanceSource = payload.attendanceSource;
    if (payload.notes !== undefined) attendance.notes = payload.notes;

    // Recalculate hours if both times exist
    if (attendance.checkIn?.time && attendance.checkOut?.time) {
        // Enforce checkout > checkin logic here in case partial updates cause conflict
        if (new Date(attendance.checkOut.time) <= new Date(attendance.checkIn.time)) {
            throw new ApiError(400, "Check-out time must be after check-in time");
        }
        attendance.totalHours = calculateHours(attendance.checkIn.time, attendance.checkOut.time);
    } else {
        attendance.totalHours = 0;
    }

    attendance.auditLogs.push({
        action: 'Approved Correction',
        modifiedBy: hrId,
        timestamp: new Date(),
        reason: "HR Update"
    });

    await attendance.save();
    return attendance;
};

/**
 * HR Retrieves a single attendance record
 */
export const hrGetAttendanceById = async (companyId, attendanceId) => {
    const attendance = await Attendance.findOne({ _id: attendanceId, companyId });
    if (!attendance) {
        throw new ApiError(404, "Attendance record not found");
    }
    return attendance;
};

/**
 * HR Queries multiple attendance records
 */
export const hrQueryAttendance = async (companyId, query) => {
    const filter = { companyId };

    if (query.employeeId) filter.employeeId = query.employeeId;
    if (query.status) filter.status = query.status;

    if (query.startDate || query.endDate) {
        filter.date = {};
        if (query.startDate) filter.date.$gte = getStartOfDay(new Date(query.startDate));
        if (query.endDate) filter.date.$lte = getStartOfDay(new Date(query.endDate));
    } else if (query.month && query.year) {
        const start = new Date(query.year, query.month - 1, 1);
        const end = new Date(query.year, query.month, 0); // last day of month
        filter.date = { $gte: getStartOfDay(start), $lte: getStartOfDay(end) };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    return records;
};

/**
 * HR Bulk Marks Attendance
 */
export const hrBulkMarkAttendance = async (companyId, hrId, records) => {
    const bulkOps = records.map((record) => {
        const date = getStartOfDay(new Date(record.date));
        
        return {
            updateOne: {
                filter: { employeeId: record.employeeId, date },
                update: {
                    $set: {
                        companyId,
                        status: record.status,
                        attendanceSource: record.attendanceSource || "HR",
                        notes: record.notes,
                        markedBy: hrId
                    },
                    $push: {
                        auditLogs: {
                            action: 'Approved Correction',
                            modifiedBy: hrId,
                            timestamp: new Date(),
                            reason: "HR Bulk Update/Insert"
                        }
                    }
                },
                upsert: true
            }
        };
    });

    const result = await Attendance.bulkWrite(bulkOps);
    return result;
};
