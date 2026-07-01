import { jest } from '@jest/globals';

jest.unstable_mockModule('cloudinary', () => {
    return {
        v2: {
            config: () => {},
            uploader: {
                upload_stream: (options, callback) => {
                    const mockStream = {
                        write: () => true,
                        end: () => {},
                        pipe: function() { return this; },
                        on: function() { return this; },
                        once: function() { return this; },
                        emit: () => {}
                    };
                    process.nextTick(() => {
                        if (callback) {
                            callback(null, {
                                secure_url: 'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.pdf',
                                public_id: 'sample_id'
                            });
                        }
                    });
                    return mockStream;
                },
                destroy: () => Promise.resolve({ result: 'ok' })
            }
        }
    };
});

const { app } = await import('../../src/app.js');
const request = (await import('supertest')).default;
const path = (await import('path')).default;
const fs = (await import('fs')).default;
const { fileURLToPath } = await import('url');
const { dirname } = await import('path');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('File Upload Integration Tests', () => {
    let candidateToken;
    let dummyFilePath;

    beforeAll(() => {
        // Create a dummy file for testing uploads
        dummyFilePath = path.join(__dirname, 'dummy.pdf');
        fs.writeFileSync(dummyFilePath, 'dummy pdf content');
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
