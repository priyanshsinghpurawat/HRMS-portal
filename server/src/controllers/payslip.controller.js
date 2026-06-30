import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as payslipService from "../services/payslip/payslip.service.js";

// --- HR / Admin Controllers ---

export const generatePayslip = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const { payrollId } = req.body;

    const payslip = await payslipService.generatePayslip(companyId, userId, payrollId);
    return res.status(201).json(new ApiResponse(201, payslip, "Payslip generated successfully"));
});

export const publishPayslip = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;
    const { payrollId } = req.body;

    const payslip = await payslipService.publishPayslip(companyId, userId, payrollId);
    return res.status(200).json(new ApiResponse(200, payslip, "Payslip published successfully"));
});

export const getAllPayslips = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const payslips = await payslipService.queryPayslips(companyId, req.query);
    return res.status(200).json(new ApiResponse(200, payslips, "Payslips retrieved successfully"));
});

export const getPayslipById = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { payslipId } = req.params;
    
    // We can reuse queryPayslips to keep it lean, or just do a direct fetch.
    const payslips = await payslipService.queryPayslips(companyId, { _id: payslipId });
    if (!payslips || payslips.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "Payslip not found"));
    }
    return res.status(200).json(new ApiResponse(200, payslips[0], "Payslip retrieved successfully"));
});

// --- Employee Self Service Controllers ---

export const getMyPayslips = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user.company;
    const employeeId = req.user._id;
    
    const payslips = await payslipService.queryPayslips(companyId, req.query, employeeId);
    return res.status(200).json(new ApiResponse(200, payslips, "Your payslips retrieved successfully"));
});

export const getMyPayslipById = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user.company;
    const employeeId = req.user._id;
    const { payslipId } = req.params;
    
    const payslips = await payslipService.queryPayslips(companyId, { _id: payslipId }, employeeId);
    if (!payslips || payslips.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "Payslip not found"));
    }
    return res.status(200).json(new ApiResponse(200, payslips[0], "Payslip retrieved successfully"));
});

export const downloadPayslipPdf = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user.company;
    const userId = req.user._id;
    const { payslipId } = req.params;
    
    // Check if the request is coming from Employee or HR (using the route structure context or user role)
    const isEmployee = req.user.role === 'EMPLOYEE' || req.originalUrl.startsWith('/api/v1/payslips');
    
    const pdfBuffer = await payslipService.getPayslipPdf(companyId, userId, payslipId, isEmployee);
    
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Payslip-${payslipId}.pdf"`,
        'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
});
