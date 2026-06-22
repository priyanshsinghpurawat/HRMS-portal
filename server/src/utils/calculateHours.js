/**
 * Calculates the difference in hours between two Date objects.
 * @param {Date} checkInTime 
 * @param {Date} checkOutTime 
 * @returns {Number} Total hours worked (rounded to 2 decimal places)
 */
export const calculateHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return 0;
  
  const diffInMs = new Date(checkOutTime) - new Date(checkInTime);
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  return Math.round(diffInHours * 100) / 100;
};
