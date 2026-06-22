/**
 * Service to handle location-based calculations
 */

// Haversine formula to calculate distance between two coordinates in meters
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Validates if the given coordinates are within the allowed geofence radius.
 * @param {Number} userLat 
 * @param {Number} userLng 
 * @param {Object} geofence - Geofence object with location.coordinates and allowedRadius
 * @returns {Boolean}
 */
export const isWithinGeofence = (userLat, userLng, geofence) => {
  if (!geofence || !geofence.location || !geofence.location.coordinates) {
    return false;
  }

  const [geofenceLng, geofenceLat] = geofence.location.coordinates;
  const distance = calculateDistance(userLat, userLng, geofenceLat, geofenceLng);
  
  return distance <= geofence.allowedRadius;
};
