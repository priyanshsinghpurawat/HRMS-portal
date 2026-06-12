/**
 * @swagger
 * tags:
 *   name: HR
 *   description: HR Profile and Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HR:
 *       type: object
 *       required:
 *         - user
 *         - company
 *         - category
 *         - personalEmail
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49c6158e00155b4125"
 *         user:
 *           $ref: '#/components/schemas/User'
 *         company:
 *           type: string
 *           description: Company ID or populated company object
 *           example: "60d5ec49c6158e00155b4123"
 *         category:
 *           type: string
 *           enum: [technical, non-technical, senior-recruiter, manager]
 *           example: "technical"
 *         personalEmail:
 *           type: string
 *           example: "harsh.jain@gmail.com"
 *         designation:
 *           type: string
 *           example: "Recruiting Manager"
 *         phone:
 *           type: string
 *           example: "+919876543211"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/hr/profile:
 *   get:
 *     summary: Get Logged In HR Profile details
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HR profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "HR profile fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/HR'
 *       404:
 *         description: HR profile not found
 */

/**
 * @swagger
 * /api/v1/hr/profile:
 *   put:
 *     summary: Update Logged In HR Profile details
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *                 example: "Senior Technical Recruiter"
 *               phone:
 *                 type: string
 *                 example: "+919999999999"
 *               personalEmail:
 *                 type: string
 *                 example: "new.personal@example.com"
 *     responses:
 *       200:
 *         description: HR profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "HR profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/HR'
 *       404:
 *         description: HR profile not found
 */
