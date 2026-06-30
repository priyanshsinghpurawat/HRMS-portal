/**
 * @swagger
 * tags:
 *   name: Holiday Calendar
 *   description: API for managing company holidays and working calendars.
 */

/**
 * @swagger
 * /api/v1/company/holidays:
 *   get:
 *     summary: Get all active company holidays
 *     tags: [Holiday Calendar]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of holidays retrieved successfully
 *   post:
 *     summary: Create a new holiday
 *     tags: [Holiday Calendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *               isRecurring:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Holiday created successfully
 *       400:
 *         description: Duplicate holiday for the date
 */

/**
 * @swagger
 * /api/v1/company/holidays/{id}:
 *   delete:
 *     summary: Soft delete a holiday
 *     tags: [Holiday Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Holiday deleted successfully
 */
