import request from 'supertest';
import { app } from '../../src/app.js';
import { Company } from '../../src/models/Company.model.js';
import { HR } from '../../src/models/HR.model.js';
import { jest } from '@jest/globals';

describe('Job Integration Tests', () => {
    let hrToken;
    let companyId;
    let hrId;

    const jobData = {
        title: 'Senior Software Engineer',
        description: 'Great role for a senior dev',
        department: 'Engineering',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salaryMin: 100000,
        salaryMax: 150000,
        location: 'Remote',
        skills: ['React', 'Node.js']
    };

    beforeEach(async () => {
        // Register company owner and company simultaneously
        const compRes = await request(app)
            .post('/api/v1/company/register')
            .send({
                email: 'owner@jobtest.com',
                password: 'Password123!',
                name: 'JobTest Corp',
                tanId: 'JBTK12345E',
                gstId: '22JBTKC1234E1Z5'
            });
        companyId = compRes.body.data.company._id;

        // Register HR user
        await request(app).post('/api/v1/auth/register').send({
            name: 'HR User',
            email: 'hr@jobtest.com',
            password: 'Password123!',
            phone: '+919876543211',
            role: 'hr'
        });

        const hrLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'hr@jobtest.com',
            password: 'Password123!'
        });
        hrToken = hrLogin.body.data.accessToken;
        hrId = hrLogin.body.data.user._id;

        // Note: In real app, company owner adds HR to company via an endpoint
        // For testing, we mock the DB state directly since the HR invite flow is complex
        await HR.create({ 
            user: hrId, 
            company: companyId, 
            personalEmail: 'hr_personal@jobtest.com',
            category: 'technical',
            isActive: true 
        });
        await Company.findByIdAndUpdate(companyId, { $push: { hrIds: hrId } });
    });

    describe('POST /api/v1/jobs', () => {
        it('should create a job and assign createdBy', async () => {
            // Mock Gemini AI fetch call
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    candidates: [{
                        content: { parts: [{ text: JSON.stringify({ isSafe: true, riskScore: 0, reasons: [] }) }] }
                    }]
                })
            });

            const response = await request(app)
                .post('/api/v1/jobs')
                .set('Authorization', `Bearer ${hrToken}`)
                .send(jobData);

            expect(response.status).toBe(201);
            expect(response.body.data.title).toBe(jobData.title);
            expect(response.body.data.company).toBeDefined();
            expect(response.body.data.aiModeration.isSafe).toBe(true);
        });
    });

    describe('GET /api/v1/jobs', () => {
        let jobId;

        beforeEach(async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    candidates: [{
                        content: { parts: [{ text: JSON.stringify({ isSafe: true }) }] }
                    }]
                })
            });
            const res = await request(app)
                .post('/api/v1/jobs')
                .set('Authorization', `Bearer ${hrToken}`)
                .send(jobData);
            jobId = res.body.data._id;
        });

        it('should get all jobs', async () => {
            const response = await request(app).get('/api/v1/jobs');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        });

        it('should get job by id', async () => {
            const response = await request(app).get(`/api/v1/jobs/${jobId}`).set('Authorization', `Bearer ${hrToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.title).toBe(jobData.title);
        });
    });
});
