import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as holidayService from "../services/holiday/holiday.service.js";

export const createHoliday = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const userId = req.user._id;

    const holiday = await holidayService.createHoliday(companyId, userId, req.body);
    return res.status(201).json(new ApiResponse(201, holiday, "Holiday created successfully"));
});

export const updateHoliday = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { holidayId } = req.params;

    const holiday = await holidayService.updateHoliday(companyId, holidayId, req.body);
    return res.status(200).json(new ApiResponse(200, holiday, "Holiday updated successfully"));
});

export const deleteHoliday = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { holidayId } = req.params;

    const holiday = await holidayService.softDeleteHoliday(companyId, holidayId);
    return res.status(200).json(new ApiResponse(200, holiday, "Holiday deleted successfully"));
});

export const queryHolidays = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || req.user._id;
    const { month, year } = req.query;

    let holidays;
    if (month && year) {
        holidays = await holidayService.getHolidaysByMonth(companyId, month, year, req.query);
    } else if (year) {
        holidays = await holidayService.getHolidaysByYear(companyId, year, req.query);
    } else {
        // Default to current year if no params provided
        const currentYear = new Date().getFullYear();
        holidays = await holidayService.getHolidaysByYear(companyId, currentYear, req.query);
    }

    return res.status(200).json(new ApiResponse(200, holidays, "Holidays retrieved successfully"));
});
