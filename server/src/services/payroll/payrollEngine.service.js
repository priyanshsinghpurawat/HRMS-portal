import { PayrollSetting } from "../../models/PayrollSetting.model.js";
import { SalaryStructure } from "../../models/SalaryStructure.model.js";
import { Attendance } from "../../models/Attendance.model.js";
import { getWorkingCalendar } from "../holiday/holiday.service.js";
import { calculateWorkingDays, executePayrollCalculation } from "./payrollCalculation.service.js";
import { createPayrollSnapshot } from "./payrollSnapshot.service.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Fetches attendance and aggregates it into a summary
 */
const getAttendanceSummary = async (companyId, employeeId, month, year) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const attendances = await Attendance.find({
        companyId,
        employeeId,
        date: { $gte: startDate, $lte: endDate }
    });

    let presentDays = 0;
    let halfDays = 0;
    let paidLeaves = 0;
    let unpaidDays = 0; // unpaid leaves or LOP
    let absentDays = 0; // explicit absent status if used

    attendances.forEach(att => {
        if (att.status === 'Present' || att.status === 'WFH') presentDays++;
        else if (att.status === 'Half Day') halfDays++;
        else if (att.status === 'Paid Leave') paidLeaves++;
        else if (att.status === 'Unpaid Leave') unpaidDays++;
        else if (att.status === 'Absent') absentDays++;
    });

    return { presentDays, halfDays, paidLeaves, unpaidDays, absentDays };
};

/**
 * Core Payroll Generation Orchestrator for a single employee
 */
export const generateEmployeePayroll = async (
    companyId, 
    userId, 
    employeeId, 
    month, 
    year, 
    manualEarnings = {}, 
    manualDeductions = {}
) => {
    // 1. Load Payroll Settings
    const settings = await PayrollSetting.findOne({ companyId });
    if (!settings || !settings.isPayrollEnabled) {
        throw new ApiError(400, "Payroll is not configured or enabled for this company.");
    }

    // 2. Load applicable Salary Structure
    // Find the latest structure effective on or before the end of the payroll month
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const salaryStructure = await SalaryStructure.findOne({
        companyId,
        employeeId,
        effectiveFrom: { $lte: endDate }
    }).sort({ effectiveFrom: -1 });

    if (!salaryStructure) {
        throw new ApiError(400, "No active salary structure found for this employee in the specified period.");
    }

    // 3. Load Working Calendar (Holidays + Weekly Offs)
    const workingCalendar = await getWorkingCalendar(companyId, month, year);

    // 4. Load Attendance
    const rawAttendance = await getAttendanceSummary(companyId, employeeId, month, year);

    // 5. Calculate Working Days and Paid Days
    const workingDaysSummary = calculateWorkingDays(rawAttendance, workingCalendar);

    // 6. Execute Mathematical Payroll Calculation
    const financials = executePayrollCalculation(
        salaryStructure, 
        workingDaysSummary, 
        settings.taxConfig, 
        manualEarnings, 
        manualDeductions
    );

    // 7. Format Snapshot Data
    const payrollData = {
        companyId,
        employeeId,
        payrollMonth: month,
        payrollYear: year,
        salarySnapshot: salaryStructure.toObject(),
        attendanceSummary: {
            totalCalendarDays: workingDaysSummary.totalCalendarDays,
            workingDays: workingDaysSummary.workingDays,
            paidDays: workingDaysSummary.paidDays,
            unpaidDays: workingDaysSummary.unpaidDays,
            absentDays: workingDaysSummary.absentDays,
            presentDays: rawAttendance.presentDays,
            halfDays: rawAttendance.halfDays,
            paidLeaves: rawAttendance.paidLeaves,
            companyHolidays: workingDaysSummary.companyHolidays,
            weeklyOffs: workingDaysSummary.weeklyOffs
        },
        earnings: {
            ...financials.proratedEarnings,
            ...financials.additionalEarnings
        },
        deductions: {
            ...financials.statutoryDeductions,
            ...financials.additionalDeductions
        },
        grossSalary: financials.finalGrossEarnings,
        netSalary: financials.netSalary,
        status: 'Draft',
        generatedBy: userId
    };

    // 8. Save via Transaction
    const payrollRecord = await createPayrollSnapshot(payrollData);

    return payrollRecord;
};
