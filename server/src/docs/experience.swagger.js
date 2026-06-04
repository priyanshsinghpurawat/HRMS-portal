/**
 * @swagger
 * tags:
 *   name: Experience
 *   description: Experience Management APIs
 */

/**
 * @swagger
 * /api/v1/experience:
 *   get:
 *     summary: Get Logged In User Experiences
 *     tags: [Experience]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Experiences fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Experience'
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: No experiences found
 */

/**
 * @swagger
 * /api/v1/experience:
 *   post:
 *     summary: Create Experience
 *     tags: [Experience]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - company
 *               - title
 *               - experienceLevel
 *               - startDate
 *
 *             properties:
 *               company:
 *                 type: string
 *
 *               title:
 *                 type: string
 *
 *               experienceLevel:
 *                 type: string
 *
 *               startDate:
 *                 type: string
 *                 format: date
 *
 *               endDate:
 *                 type: string
 *                 format: date
 *
 *               currentlyWorking:
 *                 type: boolean
 *
 *               description:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Experience added successfully
 *
 *       400:
 *         description: Validation Error
 *
 *       401:
 *         description: Unauthorized
 *
 *       409:
 *         description: Experience already exists
 */

/**
 * @swagger
 * /api/v1/experience/{experienceId}:
 *   put:
 *     summary: Update Experience
 *     tags: [Experience]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             properties:
 *               company:
 *                 type: string
 *
 *               title:
 *                 type: string
 *
 *               experienceLevel:
 *                 type: string
 *
 *               startDate:
 *                 type: string
 *                 format: date
 *
 *               endDate:
 *                 type: string
 *                 format: date
 *
 *               currentlyWorking:
 *                 type: boolean
 *
 *               description:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Experience updated successfully
 *
 *       403:
 *         description: Not authorized
 *
 *       404:
 *         description: Experience not found
 */



/**
 * @swagger
 * /api/v1/experience/{experienceId}:
 *   delete:
 *     summary: Delete Experience
 *     tags: [Experience]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: experienceId
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Experience deleted successfully
 *
 *       403:
 *         description: Not authorized
 *
 *       404:
 *         description: Experience not found
 */