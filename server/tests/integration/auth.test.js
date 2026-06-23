import request from 'supertest';
import { app } from '../../src/app.js';
import { User } from '../../src/models/User.model.js';

describe('Auth Integration Tests', () => {
    const testUser = {
        name: 'Integration User',
        email: 'integration@example.com',
        password: 'Password123!',
        phone: '+919876543210'
    };

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe(testUser.email);
            expect(response.body.data.password).toBeUndefined(); // Should not return password
        });

        it('should fail to register duplicate user', async () => {
            // First registration
            await request(app).post('/api/v1/auth/register').send(testUser);
            
            // Duplicate registration
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });

        it('should fail if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({ email: 'test@test.com' }); // Missing name, password

            expect(response.status).toBe(400); // Bad Request due to validation
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Seed a user before login tests
            await request(app).post('/api/v1/auth/register').send(testUser);
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            
            // Check cookies
            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies.some(c => c.includes('accessToken'))).toBe(true);
            expect(cookies.some(c => c.includes('refreshToken'))).toBe(true);
        });

        it('should fail with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
        });

        it('should fail if user does not exist', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123!'
                });

            expect(response.status).toBe(404);
        });
    });

    describe('Protected Routes (GET /api/v1/auth/current-user)', () => {
        let accessToken;

        beforeEach(async () => {
            await request(app).post('/api/v1/auth/register').send(testUser);
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            
            accessToken = loginRes.body.data.accessToken;
        });

        it('should access protected route with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/current-user')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe(testUser.email);
        });

        it('should deny access without token', async () => {
            const response = await request(app).get('/api/v1/auth/current-user');
            expect(response.status).toBe(401);
        });

        it('should deny access with invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/current-user')
                .set('Authorization', 'Bearer invalid_token_xyz');

            expect(response.status).toBe(401);
        });
    });
});
