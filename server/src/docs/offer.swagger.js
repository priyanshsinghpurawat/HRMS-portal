/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: HR Job Offer Management & Delivery APIs
 */

/**
 * @swagger
 * /api/v1/offers:
 *   post:
 *     summary: Generate a job offer for a candidate (HR Only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - designation
 *               - department
 *               - annualCTC
 *               - joiningDate
 *               - offerLetter
 *             properties:
 *               applicationId:
 *                 type: string
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               annualCTC:
 *                 type: number
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               offerLetter:
 *                 type: string
 *                 format: binary
 *                 description: Offer letter PDF document
 *     responses:
 *       201:
 *         description: Offer letter generated and candidate notified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/offers/my-offers:
 *   get:
 *     summary: Get candidate's pending and signed offers
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active offers list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offer'
 */

/**
 * @swagger
 * /api/v1/offers/{id}:
 *   get:
 *     summary: Get specific offer details
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID
 *     responses:
 *       200:
 *         description: Offer details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       404:
 *         description: Offer record not found
 */

/**
 * @swagger
 * /api/v1/offers/{id}/resend:
 *   post:
 *     summary: Resend offer letter email to candidate (HR Only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID
 *     responses:
 *       200:
 *         description: Offer details resent successfully
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/offers/{id}/accept:
 *   patch:
 *     summary: Accept a pending job offer
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID
 *     responses:
 *       200:
 *         description: Offer accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 */

/**
 * @swagger
 * /api/v1/offers/{id}/reject:
 *   patch:
 *     summary: Decline a pending job offer
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Offer ID
 *     responses:
 *       200:
 *         description: Offer declined successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 */
