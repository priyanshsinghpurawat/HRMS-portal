import request from 'supertest';
import { app } from '../../src/app.js';
import { Company } from '../../src/models/Company.model.js';
import { HR } from '../../src/models/HR.model.js';
import { Profile } from '../../src/models/Profile.model.js';
import { jest } from '@jest/globals';

describe('Application Integration Tests', () => {
    let hrToken;
    let candidateToken;
    let companyId;
    let jobId;
    let applicationId;

    beforeEach(async () => {
        // Register HR and Company via Company Registration
        const compRes = await request(app)
            .post('/api/v1/company/register')
            .send({
                email: 'hr_app@jobtest.com',
                password: 'Password123!',
                name: 'AppTest Corp',
                tanId: 'APPC12345E',
                gstId: '22APPCC1234E1Z5'
            });
        
        companyId = compRes.body.data.company._id;
        const ownerId = compRes.body.data.user._id;

        // Register HR User
        await request(app).post('/api/v1/auth/register').send({
            name: 'HR User',
            email: 'hr_real@apptest.com',
            password: 'Password123!',
            phone: '+919876543333',
            role: 'hr'
        });

        // Login HR to get Token
        const hrLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'hr_real@apptest.com',
            password: 'Password123!'
        });
        hrToken = hrLogin.body.data.accessToken;

        // Create HR profile for this user
        await HR.create({ 
            user: hrLogin.body.data.user._id, 
            company: companyId, 
            personalEmail: 'hr_personal@apptest.com',
            category: 'technical',
            isActive: true 
        });
        await Company.findByIdAndUpdate(companyId, { $push: { hrIds: hrLogin.body.data.user._id } });

        // Mock AI Moderation for Job Creation
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                candidates: [{
                    content: { parts: [{ text: JSON.stringify({ isSafe: true, riskScore: 0, reasons: [] }) }] }
                }]
            })
        });

        // Create Job
        const jobRes = await request(app)
            .post('/api/v1/jobs')
            .set('Authorization', `Bearer ${hrToken}`)
            .send({
                title: 'Frontend Developer',
                description: 'Build UI with React',
                department: 'Engineering',
                employmentType: 'full-time',
                experienceLevel: 'mid',
                salaryMin: 60000,
                salaryMax: 90000,
                location: 'Remote',
                skills: ['React', 'CSS', 'JavaScript']
            });
        jobId = jobRes.body.data._id;

        // Register Candidate
        await request(app).post('/api/v1/auth/register').send({
            name: 'Candidate User', email: 'candidate@test.com', password: 'Password123!', phone: '+919876543200', role: 'user'
        });
        const candLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'candidate@test.com', password: 'Password123!'
        });
        candidateToken = candLogin.body.data.accessToken;

        await Profile.findOneAndUpdate(
            { user: candLogin.body.data.user._id },
            {
                resume: {
                    url: "http://example.com/mock-resume.pdf",
                    public_id: "mock-resume-id"
                }
            }
        );
    });

    describe('POST /api/v1/jobs/:jobId/apply', () => {
        it('should allow candidate to apply to job', async () => {
            const response = await request(app)
                .post(`/api/v1/jobs/${jobId}/apply`)
                .set('Authorization', `Bearer ${candidateToken}`)
                .send({
                    coverLetter: 'I am a great fit for this React role.'
                });
            
            // Expected status 201
            expect(response.status).toBe(201);
            expect(response.body.data.job).toBe(jobId);
            applicationId = response.body.data._id;
        });

        it('should block applying without auth', async () => {
            const response = await request(app)
                .post(`/api/v1/jobs/${jobId}/apply`)
                .send({ coverLetter: 'Hello' });
            expect(response.status).toBe(401);
        });
    });
});
