import { createJobSchema } from '../../../src/validations/job.validation.js';

describe('Job Validations', () => {
    describe('createJobSchema', () => {
        it('should pass with valid data', () => {
            const data = {
                body: {
                    title: 'Software Engineer',
                    description: 'This is a long enough description.',
                    department: 'Engineering',
                    employmentType: 'full-time',
                    experienceLevel: 'mid',
                    salaryMin: 50000,
                    salaryMax: 100000,
                    location: 'Remote',
                    skills: ['JavaScript', 'Node.js']
                }
            };
            const result = createJobSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail if required fields are missing', () => {
            const data = { body: {} };
            const result = createJobSchema.safeParse(data);
            expect(result.success).toBe(false);
        });

        it('should fail if salary is negative', () => {
            const data = {
                body: {
                    title: 'Software Engineer',
                    description: 'This is a long enough description.',
                    department: 'Engineering',
                    employmentType: 'full-time',
                    experienceLevel: 'mid',
                    salaryMin: -1000,
                    salaryMax: 100000,
                    location: 'Remote'
                }
            };
            const result = createJobSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
});
