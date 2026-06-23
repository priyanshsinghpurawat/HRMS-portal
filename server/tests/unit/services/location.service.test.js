import { calculateDistance, isWithinGeofence } from '../../../src/services/location.service.js';

describe('Location Service', () => {
    describe('calculateDistance', () => {
        it('should correctly calculate distance between two coordinates', () => {
            const lat1 = 28.7041;
            const lon1 = 77.1025; // Delhi
            const lat2 = 19.0760;
            const lon2 = 72.8777; // Mumbai
            
            const distance = calculateDistance(lat1, lon1, lat2, lon2);
            expect(distance).toBeGreaterThan(1000000); // Greater than 1000km
        });
    });

    describe('isWithinGeofence', () => {
        it('should return true if within allowed radius', () => {
            const geofence = {
                location: { coordinates: [77.1025, 28.7041] },
                allowedRadius: 1000 // 1km
            };
            const result = isWithinGeofence(28.7042, 77.1025, geofence); // Very close
            expect(result).toBe(true);
        });

        it('should return false if outside allowed radius', () => {
            const geofence = {
                location: { coordinates: [77.1025, 28.7041] },
                allowedRadius: 100 // 100m
            };
            const result = isWithinGeofence(28.7141, 77.1125, geofence); // Far away
            expect(result).toBe(false);
        });

        it('should return false if geofence object is malformed', () => {
            const result = isWithinGeofence(28.7041, 77.1025, {});
            expect(result).toBe(false);
        });
    });
});
