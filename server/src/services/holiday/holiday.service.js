import { Holiday } from "../../models/Holiday.model.js";
import { PayrollSetting } from "../../models/PayrollSetting.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { getStartOfDay } from "../../utils/startOfDay.js";

/**
 * Creates a new holiday
 */
export const createHoliday = async (companyId, userId, payload) => {
    const holidayDate = getStartOfDay(new Date(payload.holidayDate));

    // Mongoose compound index handles absolute duplicates, but we do a friendly check for better error messages
    const existing = await Holiday.findOne({ companyId, holidayDate, isActive: true });
    if (existing) {
        throw new ApiError(409, `An active holiday already exists on ${holidayDate.toISOString().split('T')[0]}`);
    }

    const holiday = await Holiday.create({
        companyId,
        createdBy: userId,
        ...payload,
        holidayDate
    });

    return holiday;
};

/**
 * Updates an existing holiday
 */
export const updateHoliday = async (companyId, holidayId, payload) => {
    const holiday = await Holiday.findOne({ _id: holidayId, companyId, isActive: true });
    if (!holiday) {
        throw new ApiError(404, "Active holiday not found");
    }

    if (payload.holidayDate) {
        const newDate = getStartOfDay(new Date(payload.holidayDate));
        if (newDate.getTime() !== holiday.holidayDate.getTime()) {
            const existing = await Holiday.findOne({ companyId, holidayDate: newDate, isActive: true });
            if (existing) {
                throw new ApiError(409, `An active holiday already exists on ${newDate.toISOString().split('T')[0]}`);
            }
        }
        payload.holidayDate = newDate;
    }

    Object.assign(holiday, payload);
    await holiday.save();

    return holiday;
};

/**
 * Soft deletes a holiday
 */
export const softDeleteHoliday = async (companyId, holidayId) => {
    const holiday = await Holiday.findOne({ _id: holidayId, companyId });
    if (!holiday) {
        throw new ApiError(404, "Holiday not found");
    }

    holiday.isActive = false;
    await holiday.save();

    return holiday;
};

/**
 * Helper to dynamically project recurring holidays into a target year
 */
const projectRecurringHolidays = (holidays, targetYear) => {
    return holidays.map(h => {
        if (h.isRecurring && h.recurrenceRule === 'Yearly') {
            const originalDate = new Date(h.holidayDate);
            // Project to target year
            originalDate.setFullYear(targetYear);
            
            // Create a plain object projection
            const projected = h.toObject();
            projected.holidayDate = originalDate;
            projected.isProjected = true; // flag to indicate it's a dynamic projection
            return projected;
        }
        return h.toObject();
    });
};

/**
 * Gets holidays for a specific month and year, handling dynamic recurrence
 */
export const getHolidaysByMonth = async (companyId, month, year, queryParams = {}) => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const filter = { companyId };
    
    // Support retrieving inactive if explicitly requested (admin feature)
    if (queryParams.includeInactive !== 'true') {
        filter.isActive = true;
    }
    if (queryParams.holidayType) filter.holidayType = queryParams.holidayType;
    if (queryParams.holidayCategory) filter.holidayCategory = queryParams.holidayCategory;

    // 1. Fetch non-recurring holidays occurring precisely in this month
    const currentMonthHolidays = await Holiday.find({
        ...filter,
        isRecurring: false,
        holidayDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // 2. Fetch ALL recurring yearly holidays (since they could have been created in any past year)
    // We only need them if their original month matches the requested month
    // MongoDB aggregation could do this natively, but for simplicity we fetch all recurring and filter in-memory
    const recurringHolidays = await Holiday.find({
        ...filter,
        isRecurring: true,
        recurrenceRule: 'Yearly'
    });

    const projectedRecurring = projectRecurringHolidays(recurringHolidays, parseInt(year, 10))
        .filter(h => h.holidayDate.getMonth() + 1 === parseInt(month, 10));

    // Merge and sort
    const allHolidays = [...currentMonthHolidays.map(h => h.toObject()), ...projectedRecurring];
    allHolidays.sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));

    // Deduplicate in case a specific year override was created for a recurring holiday
    const uniqueHolidays = [];
    const seenDates = new Set();
    for (const h of allHolidays) {
        const dateStr = new Date(h.holidayDate).toISOString().split('T')[0];
        if (!seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            uniqueHolidays.push(h);
        }
    }

    return uniqueHolidays;
};

/**
 * Gets holidays for an entire year
 */
export const getHolidaysByYear = async (companyId, year, queryParams = {}) => {
    // For simplicity, we can loop through the months or just do a wider query
    // Similar logic to above: fetch current year non-recurring + project all recurring
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const filter = { companyId };
    if (queryParams.includeInactive !== 'true') filter.isActive = true;
    if (queryParams.holidayType) filter.holidayType = queryParams.holidayType;
    if (queryParams.holidayCategory) filter.holidayCategory = queryParams.holidayCategory;

    const currentYearHolidays = await Holiday.find({
        ...filter,
        isRecurring: false,
        holidayDate: { $gte: startOfYear, $lte: endOfYear }
    });

    const recurringHolidays = await Holiday.find({
        ...filter,
        isRecurring: true,
        recurrenceRule: 'Yearly'
    });

    const projectedRecurring = projectRecurringHolidays(recurringHolidays, parseInt(year, 10));

    const allHolidays = [...currentYearHolidays.map(h => h.toObject()), ...projectedRecurring];
    allHolidays.sort((a, b) => new Date(a.holidayDate) - new Date(b.holidayDate));

    const uniqueHolidays = [];
    const seenDates = new Set();
    for (const h of allHolidays) {
        const dateStr = new Date(h.holidayDate).toISOString().split('T')[0];
        if (!seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            uniqueHolidays.push(h);
        }
    }

    return uniqueHolidays;
};

/**
 * Gets a specific holiday by exact date (Checks if a date is a holiday)
 */
export const getHolidayByDate = async (companyId, dateString) => {
    const targetDate = getStartOfDay(new Date(dateString));
    const targetMonth = targetDate.getMonth() + 1;
    const targetYear = targetDate.getFullYear();

    // Instead of duplicating logic, leverage the monthly query which already handles recurrence
    const monthlyHolidays = await getHolidaysByMonth(companyId, targetMonth, targetYear);
    
    return monthlyHolidays.find(h => {
        return new Date(h.holidayDate).getTime() === targetDate.getTime();
    }) || null;
};

export const checkHoliday = async (companyId, dateString) => {
    const holiday = await getHolidayByDate(companyId, dateString);
    return !!holiday;
};

export const getMandatoryHolidays = async (companyId, year) => {
    return await getHolidaysByYear(companyId, year, { holidayCategory: 'Mandatory' });
};

export const getOptionalHolidays = async (companyId, year) => {
    return await getHolidaysByYear(companyId, year, { holidayCategory: 'Optional' });
};

/**
 * Unifies Weekly Offs and Holidays into a normalized Working Calendar
 */
export const getWorkingCalendar = async (companyId, month, year) => {
    // 1. Fetch Company Settings for Weekly Offs
    const settings = await PayrollSetting.findOne({ companyId });
    const weeklyOffs = settings ? settings.weeklyOffDays : ["Sunday"];

    // 2. Fetch Holidays for the month
    const holidays = await getHolidaysByMonth(companyId, month, year);
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendar = [];
    
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        const dayName = daysOfWeek[currentDate.getDay()];
        
        const isWeeklyOff = weeklyOffs.includes(dayName);
        const holidayOnThisDay = holidays.find(h => new Date(h.holidayDate).getTime() === currentDate.getTime());

        calendar.push({
            date: currentDate.toISOString().split('T')[0],
            dayOfWeek: dayName,
            isWorkingDay: !isWeeklyOff && !holidayOnThisDay,
            isWeeklyOff,
            holiday: holidayOnThisDay ? {
                name: holidayOnThisDay.holidayName,
                type: holidayOnThisDay.holidayType,
                category: holidayOnThisDay.holidayCategory
            } : null
        });
    }

    return calendar;
};
