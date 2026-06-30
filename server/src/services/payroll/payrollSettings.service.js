import { PayrollSetting } from "../../models/PayrollSetting.model.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Ensures only one payroll setting document exists per company, creates if not exists
 */
export const createPayrollSettings = async (companyId, payload) => {
    const existingSettings = await PayrollSetting.findOne({ companyId });
    if (existingSettings) {
        throw new ApiError(409, "Payroll settings already exist for this company");
    }

    const settings = await PayrollSetting.create({
        companyId,
        ...payload
    });

    return settings;
};

/**
 * Retrieves the payroll settings for a company
 */
export const getPayrollSettings = async (companyId) => {
    const settings = await PayrollSetting.findOne({ companyId });
    if (!settings) {
        throw new ApiError(404, "Payroll settings not found for this company");
    }
    return settings;
};

/**
 * Updates the payroll settings
 */
export const updatePayrollSettings = async (companyId, payload) => {
    const settings = await PayrollSetting.findOneAndUpdate(
        { companyId },
        { $set: payload },
        { new: true, runValidators: true }
    );

    if (!settings) {
        throw new ApiError(404, "Payroll settings not found");
    }

    return settings;
};

/**
 * Adds a new holiday
 */
export const addHoliday = async (companyId, holidayPayload) => {
    // Check if a holiday with same name or date already exists
    const settings = await PayrollSetting.findOne({ companyId });
    if (!settings) {
        throw new ApiError(404, "Payroll settings not found");
    }

    const duplicateDate = settings.publicHolidays.find(
        (h) => new Date(h.date).getTime() === new Date(holidayPayload.date).getTime()
    );

    if (duplicateDate) {
        throw new ApiError(409, "A holiday already exists on this date");
    }

    settings.publicHolidays.push(holidayPayload);
    await settings.save();

    return settings;
};

/**
 * Updates an existing holiday
 */
export const updateHoliday = async (companyId, holidayId, holidayPayload) => {
    const settings = await PayrollSetting.findOneAndUpdate(
        { companyId, "publicHolidays._id": holidayId },
        { 
            $set: {
                "publicHolidays.$.name": holidayPayload.name,
                "publicHolidays.$.date": holidayPayload.date,
                "publicHolidays.$.description": holidayPayload.description,
                "publicHolidays.$.isOptional": holidayPayload.isOptional,
            }
        },
        { new: true, runValidators: true }
    );

    if (!settings) {
        throw new ApiError(404, "Holiday or Payroll settings not found");
    }

    return settings;
};

/**
 * Deletes a holiday
 */
export const deleteHoliday = async (companyId, holidayId) => {
    const settings = await PayrollSetting.findOneAndUpdate(
        { companyId },
        { $pull: { publicHolidays: { _id: holidayId } } },
        { new: true }
    );

    if (!settings) {
        throw new ApiError(404, "Payroll settings not found");
    }

    return settings;
};
