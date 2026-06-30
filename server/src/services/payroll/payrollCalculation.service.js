import { calculateStatutoryDeductions, calculateAdditionalDeductions } from "./deduction.service.js";
import { calculateAdditionalEarnings } from "./earning.service.js";

/**
 * Calculates Paid/Unpaid days based on attendance summary and calendar
 */
export const calculateWorkingDays = (attendanceSummary, workingCalendar) => {
    // Total calendar days from Working Calendar
    const totalCalendarDays = workingCalendar.length;
    
    // Total weekly offs and holidays
    const weeklyOffs = workingCalendar.filter(day => day.isWeeklyOff && !day.holiday).length;
    const companyHolidays = workingCalendar.filter(day => !!day.holiday).length;
    
    const workingDays = totalCalendarDays - weeklyOffs - companyHolidays;

    // Calculate Paid Days:
    // Employee is paid for: Present days, Approved Paid Leaves, Weekly Offs, and Company Holidays.
    // Assuming absent/unpaid leaves are not paid. Half days count as 0.5 paid day.
    
    const fullPresent = attendanceSummary.presentDays || 0;
    const halfDays = attendanceSummary.halfDays || 0;
    const paidLeaves = attendanceSummary.paidLeaves || 0;
    const absentDays = attendanceSummary.absentDays || 0;
    const unpaidLeaves = attendanceSummary.unpaidDays || 0;

    // A standard calculation:
    // total paid days = present + (halfDays * 0.5) + paidLeaves + weeklyOffs + companyHolidays
    let paidDays = fullPresent + (halfDays * 0.5) + paidLeaves + weeklyOffs + companyHolidays;

    // Cap paid days to calendar days in case of overlap anomalies
    if (paidDays > totalCalendarDays) paidDays = totalCalendarDays;

    let totalUnpaidDays = absentDays + unpaidLeaves + (halfDays * 0.5);

    return {
        totalCalendarDays,
        workingDays,
        weeklyOffs,
        companyHolidays,
        paidDays,
        unpaidDays: totalUnpaidDays,
        absentDays
    };
};

/**
 * Core mathematical calculation of the payload
 */
export const executePayrollCalculation = (
    salaryStructure, 
    workingDaysSummary, 
    taxConfig, 
    manualEarnings, 
    manualDeductions
) => {
    const { grossSalary, basicSalary, hra, specialAllowance, medicalAllowance, conveyanceAllowance, otherAllowances } = salaryStructure;
    const { totalCalendarDays, paidDays, unpaidDays } = workingDaysSummary;

    // Daily salary
    const dailyGross = grossSalary / totalCalendarDays;
    
    // Prorate components based on paid days
    const proratedFactor = paidDays / totalCalendarDays;

    const proratedEarnings = {
        basicSalary: Math.round(basicSalary * proratedFactor),
        hra: Math.round(hra * proratedFactor),
        specialAllowance: Math.round(specialAllowance * proratedFactor),
        medicalAllowance: Math.round(medicalAllowance * proratedFactor),
        conveyanceAllowance: Math.round(conveyanceAllowance * proratedFactor),
        otherAllowances: Math.round(otherAllowances * proratedFactor)
    };

    const actualGrossSalary = Math.round(grossSalary * proratedFactor);

    // Get Additional Earnings
    const additionalEarnings = calculateAdditionalEarnings(manualEarnings);
    
    // Total Gross including additional earnings
    const finalGrossEarnings = actualGrossSalary + additionalEarnings.totalAdditional;

    // Get Deductions
    const statutoryDeductions = calculateStatutoryDeductions(finalGrossEarnings, proratedEarnings.basicSalary, taxConfig);
    
    // LOP is already implicitly handled by the prorated actualGrossSalary, but we log it via unpaidDays in deductions
    const additionalDeductions = calculateAdditionalDeductions(dailyGross, unpaidDays, manualDeductions);

    // The prorated structure automatically deducts Loss Of Pay from the earnings side. 
    // We just track it in the deductions summary for payslip display.
    
    const totalDeductions = statutoryDeductions.totalStatutory + (additionalDeductions.totalAdditional - additionalDeductions.lossOfPay); 
    // We subtract lossOfPay from total deductions here because it's already deducted from finalGrossEarnings via proration.

    const netSalary = finalGrossEarnings - totalDeductions;

    return {
        proratedEarnings,
        additionalEarnings,
        statutoryDeductions,
        additionalDeductions,
        finalGrossEarnings,
        totalDeductions,
        netSalary
    };
};
