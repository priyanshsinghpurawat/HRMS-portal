import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getDashboardSummary } from "../services/reports/dashboard.service.js";
import { getPayrollRegister, getEmployeePayrollHistory } from "../services/reports/payrollReport.service.js";
import { getStatutoryReport } from "../services/reports/statutoryReport.service.js";
import { getPayrollAnalytics } from "../services/reports/analytics.service.js";
import { generateReportExport } from "../services/reports/export.service.js";

// --- Dashboard & Analytics ---

export const getDashboard = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const data = await getDashboardSummary(companyId, req.query);
    return res.status(200).json(new ApiResponse(200, data, "Dashboard summary retrieved successfully"));
});

export const getAnalytics = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const year = req.query.year || new Date().getFullYear();
    const data = await getPayrollAnalytics(companyId, year);
    return res.status(200).json(new ApiResponse(200, data, "Analytics retrieved successfully"));
});

// --- Payroll Reports ---

export const getPayrollReport = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const data = await getPayrollRegister(companyId, req.query);
    return res.status(200).json(new ApiResponse(200, data, "Payroll report retrieved successfully"));
});

export const getEmployeeReport = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { employeeId } = req.params;
    const data = await getEmployeePayrollHistory(companyId, employeeId);
    return res.status(200).json(new ApiResponse(200, data, "Employee payroll history retrieved successfully"));
});

// --- Statutory Reports ---

export const getStatutoryPF = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const data = await getStatutoryReport(companyId, 'pf', req.query);
    return res.status(200).json(new ApiResponse(200, data, "PF report retrieved successfully"));
});

export const getStatutoryESIC = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const data = await getStatutoryReport(companyId, 'esic', req.query);
    return res.status(200).json(new ApiResponse(200, data, "ESIC report retrieved successfully"));
});

export const getStatutoryPT = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const data = await getStatutoryReport(companyId, 'pt', req.query);
    return res.status(200).json(new ApiResponse(200, data, "PT report retrieved successfully"));
});

export const getStatutoryTDS = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const data = await getStatutoryReport(companyId, 'tds', req.query);
    return res.status(200).json(new ApiResponse(200, data, "TDS report retrieved successfully"));
});

// --- Exports ---

export const exportReport = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const exportType = req.query.exportType || 'csv';
    
    if (exportType === 'pdf') {
        return res.status(400).json(new ApiResponse(400, null, "PDF export is not supported for mass tabular reports in this phase. Please use CSV or XLSX."));
    }

    const { buffer, contentType, extension } = await generateReportExport(companyId, req.query, exportType);

    res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="Payroll_Report.${extension}"`,
        'Content-Length': buffer.length
    });

    res.send(buffer);
});
