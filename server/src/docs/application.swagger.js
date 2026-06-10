/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Candidate Job Applications & Onboarding Pipeline APIs
 */

/**
 * @swagger
 * /api/v1/jobs/{jobId}/apply:
 *   post:
 *     summary: Apply to a job listing
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the Job listing
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverLetter:
 *                 type: string
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Optional new resume file to upload (DOC, DOCX, or PDF)
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       400:
 *         description: Missing resume file or profile resume link
 *       409:
 *         description: Already applied to this job listing
 */

/**
 * @swagger
 * /api/v1/applications/my-applications:
 *   get:
 *     summary: Get candidate's job applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of candidate applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Application'
 */

/**
 * @swagger
 * /api/v1/applications/{id}:
 *   get:
 *     summary: Get specific candidate application details
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Application'
 *       404:
 *         description: Application not found
 */

/**
 * @swagger
 * /api/v1/applications/hr/jobs/{jobId}/applications:
 *   get:
 *     summary: Get all applications for a company job listing (HR Only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Job ID
 *     responses:
 *       200:
 *         description: Company applications list retrieved successfully
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/applications/hr/applications/{id}/status:
 *   patch:
 *     summary: Modify application status (HR Only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - internalStatus
 *             properties:
 *               internalStatus:
 *                 type: string
 *                 enum: [APPLIED, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, SELECTED, OFFER_SENT, OFFER_ACCEPTED, HIRED, NOT_SELECTED]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/applications/hr/applications/{id}/queue:
 *   patch:
 *     summary: Reassign applicant queue status manually (HR Only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - queueStatus
 *             properties:
 *               queueStatus:
 *                 type: string
 *                 enum: [shortlist_queue, hold_queue, review_queue]
 *     responses:
 *       200:
 *         description: Queue status updated successfully
 *       403:
 *         description: Access Denied
 */
