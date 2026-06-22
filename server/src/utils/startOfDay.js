/**
 * Returns the start of the day (00:00:00) for a given date in UTC to normalize database queries.
 * @param {Date|String} date 
 * @returns {Date} Start of the day date object
 */
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
