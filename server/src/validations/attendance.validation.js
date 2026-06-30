import { z } from "zod";

const attendanceStatuses = ['Present', 'Absent', 'Half Day', 'Late', 'Leave', 'Work From Home', 'Weekly Off', 'Company Holiday', 'Paid Leave', 'Unpaid Leave'];
const attendanceSources = ['WEB', 'MOBILE', 'BIOMETRIC', 'GPS', 'FACE_RECOGNITION', 'HR', 'SYSTEM'];

export const hrMarkAttendanceSchema = z.object({
    body: z.object({
        employeeId: z.string().min(1, "Employee ID is required"),
        date: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),
        checkInTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid checkInTime date format",
        }).optional(),
        checkOutTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid checkOutTime date format",
        }).optional(),
        status: z.enum(attendanceStatuses, {
            errorMap: () => ({ message: `Status must be one of: ${attendanceStatuses.join(', ')}` })
        }),
        attendanceSource: z.enum(attendanceSources).optional(),
        notes: z.string().optional()
    }).refine((data) => {
        if (data.checkInTime && data.checkOutTime) {
            return new Date(data.checkOutTime) > new Date(data.checkInTime);
        }
        return true;
    }, {
        message: "Check-out time must be after check-in time",
        path: ["checkOutTime"]
    })
});

export const hrUpdateAttendanceSchema = z.object({
    body: z.object({
        checkInTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid checkInTime date format",
        }).optional(),
        checkOutTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid checkOutTime date format",
        }).optional(),
        status: z.enum(attendanceStatuses).optional(),
        attendanceSource: z.enum(attendanceSources).optional(),
        notes: z.string().optional()
    }).refine((data) => {
        if (data.checkInTime && data.checkOutTime) {
            return new Date(data.checkOutTime) > new Date(data.checkInTime);
        }
        return true;
    }, {
        message: "Check-out time must be after check-in time",
        path: ["checkOutTime"]
    })
});

export const hrBulkAttendanceSchema = z.object({
    body: z.object({
        records: z.array(z.object({
            employeeId: z.string().min(1, "Employee ID is required"),
            date: z.string().refine((date) => !isNaN(Date.parse(date)), {
                message: "Invalid date format",
            }),
            status: z.enum(attendanceStatuses),
            attendanceSource: z.enum(attendanceSources).optional(),
            notes: z.string().optional()
        })).min(1, "At least one record is required")
    })
});
