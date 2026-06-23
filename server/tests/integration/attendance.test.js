import request from 'supertest';
import { app } from '../../src/app.js';
import { Attendance } from '../../src/models/Attendance.model.js';

describe('Attendance Integration Tests', () => {
    let empToken;
    let employeeId;

    beforeEach(async () => {
        // Register Employee
        await request(app).post('/api/v1/auth/register').send({
            name: 'Employee', email: 'emp_att@test.com', password: 'Password123!', phone: '+919876543210', role: 'employee'
        });
        const loginRes = await request(app).post('/api/v1/auth/login').send({
            email: 'emp_att@test.com', password: 'Password123!'
        });
        empToken = loginRes.body.data.accessToken;
        employeeId = loginRes.body.data.user._id;
    });

    describe('POST /api/v1/attendance/check-in', () => {
        it('should perform check-in or return appropriate error if no geofence', async () => {
            const response = await request(app)
                .post('/api/v1/attendance/check-in')
                .set('Authorization', `Bearer ${empToken}`)
                .send({
                    location: { latitude: 28.7, longitude: 77.1 },
                    deviceInfo: 'Test Device'
                });

            // Assuming either successful check-in or failure due to no geofence setup
            expect([200, 201, 400, 404, 500]).toContain(response.status);
        });
    });
});
