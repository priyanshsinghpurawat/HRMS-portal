/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job Postings, Search, & AI Moderation APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - company
 *         - createdBy
 *         - department
 *         - employmentType
 *         - experienceLevel
 *         - salaryMin
 *         - salaryMax
 *         - location
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49c6158e00155b4124"
 *         title:
 *           type: string
 *           example: "Software Engineer - Backend"
 *         description:
 *           type: string
 *           example: "Looking for an experienced backend developer. Must know Node.js and MongoDB."
 *         company:
 *           type: string
 *           description: Company ID owning the job posting
 *           example: "60d5ec49c6158e00155b4123"
 *         createdBy:
 *           type: string
 *           description: HR profile ID who posted the job
 *           example: "60d5ec49c6158e00155b4125"
 *         department:
 *           type: string
 *           example: "Engineering"
 *         employmentType:
 *           type: string
 *           enum: [full-time, part-time, internship, contract, remote]
 *           example: "full-time"
 *         experienceLevel:
 *           type: string
 *           enum: [fresher, junior, mid, senior]
 *           example: "junior"
 *         salaryMin:
 *           type: number
 *           example: 600000
 *         salaryMax:
 *           type: number
 *           example: 1000000
 *         location:
 *           type: string
 *           example: "Mohali, India"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Node.js", "MongoDB", "Express"]
 *         openings:
 *           type: number
 *           default: 1
 *           example: 2
 *         applicationCount:
 *           type: number
 *           default: 0
 *           example: 5
 *         status:
 *           type: string
 *           enum: [draft, active, closed]
 *           example: "active"
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         aiModeration:
 *           type: object
 *           properties:
 *             isChecked:
 *               type: boolean
 *               example: true
 *             isSafe:
 *               type: boolean
 *               example: true
 *             riskScore:
 *               type: number
 *               example: 0
 *             reasons:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Passed offline fallback policy checks."]
 *             checkedAt:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/jobs:
 *   get:
 *     summary: Retrieve active public job listings (Search / Candidates)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter jobs by location
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter jobs by department name
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, internship, contract, remote]
 *         description: Filter jobs by employment type
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [fresher, junior, mid, senior]
 *         description: Filter jobs by experience level
 *     responses:
 *       200:
 *         description: Active jobs list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 */

/**
 * @swagger
 * /api/v1/jobs/{id}/public:
 *   get:
 *     summary: Retrieve public job details
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job listing not found
 */

/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     summary: Post a new job listing (HR Only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - department
 *               - employmentType
 *               - experienceLevel
 *               - salaryMin
 *               - salaryMax
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Software Engineer - Backend"
 *               description:
 *                 type: string
 *                 example: "Looking for an experienced backend developer. Must know Node.js and MongoDB."
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *               employmentType:
 *                 type: string
 *                 enum: [full-time, part-time, internship, contract, remote]
 *                 example: "full-time"
 *               experienceLevel:
 *                 type: string
 *                 enum: [fresher, junior, mid, senior]
 *                 example: "junior"
 *               salaryMin:
 *                 type: number
 *                 example: 600000
 *               salaryMax:
 *                 type: number
 *                 example: 1000000
 *               location:
 *                 type: string
 *                 example: "Mohali, India"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Node.js", "MongoDB"]
 *               openings:
 *                 type: number
 *                 default: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Job posted successfully and checked with AI moderation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Job posting blocked due to policy violations (AI check failed) or validation error
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/jobs/my-jobs:
 *   get:
 *     summary: Get all job postings created by the authenticated HR user (HR Only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HR's job listings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Retrieve specific job details (HR Only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Job listing not found
 */

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   put:
 *     summary: Modify a job listing details (HR Only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               department:
 *                 type: string
 *               employmentType:
 *                 type: string
 *                 enum: [full-time, part-time, internship, contract, remote]
 *               experienceLevel:
 *                 type: string
 *                 enum: [fresher, junior, mid, senior]
 *               salaryMin:
 *                 type: number
 *               salaryMax:
 *                 type: number
 *               location:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               openings:
 *                 type: number
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Job listing not found
 */

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   delete:
 *     summary: Soft delete a job listing (HR Only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job listing soft deleted successfully
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Job listing not found
 */

/**
 * @swagger
 * /api/v1/jobs/{id}/close:
 *   patch:
 *     summary: Close a job listing (HR Only)
 *     description: Set the job status to 'closed'. Only HRs associated with the company that posted the job can close it.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job listing closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job listing closed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid Job ID format
 *       403:
 *         description: Access Denied - HR belongs to another company or not authorized
 *       404:
 *         description: Job listing not found
 *       500:
 *         description: Internal Server Error
 *
 * /api/v1/jobs/{id}/reopen:
 *   patch:
 *     summary: Reopen a job listing (HR Only)
 *     description: Set the job status to 'active'. Only HRs associated with the company that posted the job can reopen it.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job listing reopened successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job listing reopened successfully
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Invalid Job ID format
 *       403:
 *         description: Access Denied - HR belongs to another company or not authorized
 *       404:
 *         description: Job listing not found
 *       500:
 *         description: Internal Server Error
 */

