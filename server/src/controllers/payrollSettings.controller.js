import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as payrollService from "../services/payroll/payrollSettings.service.js";

/**
 * Creates payroll settings for the company
 */
export const createSettings = asyncHandler(async (req, res) => {
    // We assume the auth middleware adds the companyId to req.user (e.g. req.user.companyId or req.user.id depending on DB schema)
    // Looking at the Company model, it has ownerId. If the user is the company owner, we should probably fetch the Company first or expect companyId in req.body/params.
    // For now, assuming we use req.user._id as the owner, let's just assume companyId is available or we'll pass a fixed ID. 
    // Actually, in HRMS, if role is COMPANY, `req.user._id` might be the owner. Let's look up the company by ownerId.
    // Or if the route passes companyId in params, but it's not in the requirements for params. We'll assume the company is fetched by req.user._id.
    
    // To strictly follow the service call:
    const companyId = req.user.companyId; // Ensure your auth middleware sets this, or derive it here

    const settings = await payrollService.createPayrollSettings(companyId, req.body);
    
    return res.status(201).json(
        new ApiResponse(201, settings, "Payroll settings created successfully")
    );
});

/**
 * Retrieves the payroll settings for a company
 */
export const getSettings = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;

    const settings = await payrollService.getPayrollSettings(companyId);

    return res.status(200).json(
        new ApiResponse(200, settings, "Payroll settings retrieved successfully")
    );
});

/**
 * Updates the payroll settings
 */
export const updateSettings = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;

    const settings = await payrollService.updatePayrollSettings(companyId, req.body);

    return res.status(200).json(
        new ApiResponse(200, settings, "Payroll settings updated successfully")
    );
});

/**
 * Adds a new holiday
 */
export const addHoliday = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;

    const settings = await payrollService.addHoliday(companyId, req.body);

    return res.status(201).json(
        new ApiResponse(201, settings, "Holiday added successfully")
    );
});

/**
 * Updates an existing holiday
 */
export const updateHoliday = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const { holidayId } = req.params;

    const settings = await payrollService.updateHoliday(companyId, holidayId, req.body);

    return res.status(200).json(
        new ApiResponse(200, settings, "Holiday updated successfully")
    );
});

/**
 * Deletes a holiday
 */
export const removeHoliday = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const { holidayId } = req.params;

    const settings = await payrollService.deleteHoliday(companyId, holidayId);

    return res.status(200).json(
        new ApiResponse(200, settings, "Holiday deleted successfully")
    );
});
