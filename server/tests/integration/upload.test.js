import request from 'supertest';
import { app } from '../../src/app.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('File Upload Integration Tests', () => {
    let candidateToken;
    let dummyFilePath;

    beforeAll(() => {
        // Create a dummy file for testing uploads
        dummyFilePath = path.join(__dirname, 'dummy.pdf');
        fs.writeFileSync(dummyFilePath, 'dummy pdf content');

        // Mock Cloudinary upload
        jest.spyOn(cloudinary.uploader, 'upload').mockResolvedValue({
            secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.pdf',
            public_id: 'sample_id'
        });
    });

    afterAll(() => {
        // Clean up dummy file
        if (fs.existsSync(dummyFilePath)) {
            fs.unlinkSync(dummyFilePath);
        }
    });

    beforeEach(async () => {
        // Register Candidate User for user Token
        const candRes = await request(app).post('/api/v1/auth/register').send({
            name: 'Candidate User', email: 'upload_sec@test.com', password: 'Password123!', phone: '+919876543112', role: 'user'
        });
        const candLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'upload_sec@test.com', password: 'Password123!'
        });
        candidateToken = candLogin.body.data.accessToken;
    });

    describe('Resume Upload (Profile)', () => {
        it('should allow user to upload a resume', async () => {
            const response = await request(app)
                .put('/api/v1/profile/resume')
                .set('Authorization', `Bearer ${candidateToken}`)
                .attach('resume', dummyFilePath);

            expect(response.status).toBe(200);
            expect(response.body.data.resume).toBeDefined();
        });
    });
});
