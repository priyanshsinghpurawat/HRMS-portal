import { getStartOfDay } from '../../../src/utils/startOfDay.js';

describe('getStartOfDay', () => {
    it('should return a date set to midnight UTC for the given date', () => {
        const date = new Date('2024-01-15T15:45:30Z');
        const start = getStartOfDay(date);
        
        expect(start.getUTCFullYear()).toBe(2024);
        expect(start.getUTCMonth()).toBe(0);
        expect(start.getUTCDate()).toBe(15);
        expect(start.getUTCHours()).toBe(0);
        expect(start.getUTCMinutes()).toBe(0);
        expect(start.getUTCSeconds()).toBe(0);
        expect(start.getUTCMilliseconds()).toBe(0);
    });
});
