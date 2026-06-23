import { calculateHours } from '../../../src/utils/calculateHours.js';

describe('calculateHours', () => {
    it('should correctly calculate difference in hours', () => {
        const checkIn = new Date('2024-01-01T09:00:00Z');
        const checkOut = new Date('2024-01-01T17:30:00Z');
        
        const hours = calculateHours(checkIn, checkOut);
        expect(hours).toBeCloseTo(8.5, 1);
    });

    it('should return 0 if checkOut is before checkIn', () => {
        const checkIn = new Date('2024-01-01T17:30:00Z');
        const checkOut = new Date('2024-01-01T09:00:00Z');
        
        const hours = calculateHours(checkIn, checkOut);
        expect(hours).toBeLessThan(0);
    });
});
