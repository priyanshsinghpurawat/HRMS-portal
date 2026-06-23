import request from 'supertest';
import { app } from '../../src/app.js';
import { Company } from '../../src/models/Company.model.js';

describe('Company Integration Tests', () => {
    let companyData = {
        name: 'Integration Corp',
        email: 'owner@integrationcorp.com',
        password: 'Password123!',
        tanId: 'INTG12345E',
        gstId: '22INTGC1234E1Z5'
    };

    describe('POST /api/v1/company/register', () => {
        it('should create a new company successfully', async () => {
            const response = await request(app)
                .post('/api/v1/company/register')
                .send(companyData);

            expect(response.status).toBe(201);
            expect(response.body.data.company.name).toBe(companyData.name);
            expect(response.body.data.user.email).toBe(companyData.email);
        });

        it('should reject creation if validation fails', async () => {
            const response = await request(app)
                .post('/api/v1/company/register')
                .send({ name: 'Short' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/company/profile/:id', () => {
        let companyId;
        let userToken;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/v1/company/register')
                .send(companyData);
                
            companyId = res.body.data.company._id;
            userToken = res.body.data.accessToken;
        });

        it('should get company details', async () => {
            const response = await request(app)
                .get(`/api/v1/company/profile/${companyId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe(companyData.name);
        });
    });
});
