import { hrMarkAttendance } from "../attendance/attendance.service.js";
import { getStartOfDay } from "../../utils/startOfDay.js";
import { Attendance } from "../../models/Attendance.model.js";

/**
 * Synchronizes an approved leave request into the Attendance module
 */
export const syncApprovedLeaveToAttendance = async (leaveRequest, policy, hrId) => {
    const { companyId, employeeId, startDate, endDate, halfDayInformation, reason } = leaveRequest;
    
    let currentDate = getStartOfDay(startDate);
    const end = getStartOfDay(endDate);

    const attendanceStatus = policy.isPaid ? 'Paid Leave' : 'Unpaid Leave';

    // Loop through each day of the leave
    while (currentDate <= end) {
        const dateString = currentDate.toISOString();
        
        let dailyStatus = attendanceStatus;
        if (halfDayInformation !== 'None') {
            dailyStatus = 'Half Day';
        }

        try {
            // Check if attendance already exists
            const existing = await Attendance.findOne({ employeeId, date: currentDate });
            
            if (existing) {
                // We use update logic manually to avoid conflicting with attendance service restrictions
                existing.status = dailyStatus;
                existing.auditLogs.push({
                    action: 'Approved Correction',
                    modifiedBy: hrId,
                    timestamp: new Date(),
                    reason: `Leave Request Approved: ${reason}`
                });
                await existing.save();
            } else {
                // Create new attendance record representing the leave
                await hrMarkAttendance(companyId, hrId, {
                    employeeId,
                    date: dateString,
                    status: dailyStatus,
                    attendanceSource: 'SYSTEM',
                    notes: `Leave Request Approved: ${reason}`
                });
            }
        } catch (error) {
            console.error(`Failed to sync attendance for ${dateString}:`, error);
            // Non-blocking catch to ensure one failed sync doesn't completely fail the loop
        }

        // Increment current date by 1 day
        currentDate.setDate(currentDate.getDate() + 1);
    }
};
