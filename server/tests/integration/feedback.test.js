import request from 'supertest';
import { app } from '../../src/app.js';
import { Company } from '../../src/models/Company.model.js';
import { Feedback } from '../../src/models/Feedback.model.js';

describe('Feedback Integration Tests', () => {
    let companyToken;
    let companyId;
    let otherCompanyToken;
    let otherCompanyId;

    const companyData = {
        name: 'Feedback Company One',
        email: 'owner1@feedbackcorp.com',
        password: 'Password123!',
        tanId: 'FEED12345E',
        gstId: '22FEEDC1234E1Z5'
    };

    const otherCompanyData = {
        name: 'Feedback Company Two',
        email: 'owner2@feedbackcorp.com',
        password: 'Password123!',
        tanId: 'FEED54321E',
        gstId: '22FEEDC5432E1Z5'
    };

    beforeEach(async () => {
        // Register first company
        const res1 = await request(app)
            .post('/api/v1/company/register')
            .send(companyData);
        companyId = res1.body.data.company._id;
        companyToken = res1.body.data.accessToken;

        // Register second company
        const res2 = await request(app)
            .post('/api/v1/company/register')
            .send(otherCompanyData);
        otherCompanyId = res2.body.data.company._id;
        otherCompanyToken = res2.body.data.accessToken;
    });

    describe('POST /api/v1/feedback', () => {
        it('should allow company to post feedback successfully', async () => {
            const feedbackData = {
                title: 'Excellent platform',
                description: 'We had an amazing hiring experience',
                rating: 5,
                companyID: companyId
            };

            const response = await request(app)
                .post('/api/v1/feedback')
                .set('Authorization', `Bearer ${companyToken}`)
                .send(feedbackData);

            expect(response.status).toBe(201);
            expect(response.body.data.title).toBe(feedbackData.title);
            expect(response.body.data.description).toBe(feedbackData.description);
            expect(response.body.data.rating).toBe(feedbackData.rating);
            expect(response.body.data.companyId).toBe(companyId);
        });

        it('should reject feedback if user is not authorized for the company ID', async () => {
            const feedbackData = {
                title: 'Hacked feedback',
                description: 'Trying to post feedback for company 1 using company 2 token',
                rating: 1,
                companyID: companyId
            };

            const response = await request(app)
                .post('/api/v1/feedback')
                .set('Authorization', `Bearer ${otherCompanyToken}`)
                .send(feedbackData);

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('not authorized');
        });

        it('should fail with validation error for invalid rating', async () => {
            const feedbackData = {
                title: 'Bad rating',
                description: 'Rating is out of range',
                rating: 6,
                companyID: companyId
            };

            const response = await request(app)
                .post('/api/v1/feedback')
                .set('Authorization', `Bearer ${companyToken}`)
                .send(feedbackData);

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/feedback (Public)', () => {
        beforeEach(async () => {
            // Post two feedbacks
            await Feedback.create({
                title: 'First feedback',
                description: 'Great platform',
                rating: 5,
                companyId: companyId,
                userId: '60c72b2f9b1d8e256c7038bb' // random user id
            });

            await Feedback.create({
                title: 'Second feedback',
                description: 'Nice jobs',
                rating: 4,
                companyId: otherCompanyId,
                userId: '60c72b2f9b1d8e256c7038bc' // random user id
            });
        });

        it('should fetch all feedbacks WITHOUT authentication (public)', async () => {
            const response = await request(app)
                .get('/api/v1/feedback');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(2);

            const firstFeedback = response.body.data.find(f => f.title === 'First feedback');
            expect(firstFeedback).toBeDefined();
            expect(firstFeedback.companyName).toBe(companyData.name);
            expect(firstFeedback.companyProfilePhoto).toBeDefined();
            expect(firstFeedback.description).toBe('Great platform');
            expect(firstFeedback.rating).toBe(5);
        });

        it('should return feedbacks from all companies', async () => {
            const response = await request(app)
                .get('/api/v1/feedback');

            expect(response.status).toBe(200);
            const names = response.body.data.map(f => f.companyName);
            expect(names).toContain(companyData.name);
            expect(names).toContain(otherCompanyData.name);
        });
    });
});
