/**
 * @swagger
 * tags:
 *   name: Education
 *   description: Education Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Education:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         institution:
 *           type: string
 *         degree:
 *           type: string
 *         fieldOfStudy:
 *           type: string
 *         educationLevel:
 *           type: string
 *           example: bachelor
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *         currentlyStudying:
 *           type: boolean
 *         grade:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/education/create:
 *   post:
 *     summary: Create Education Record
 *     tags: [Education]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - institution
 *               - degree
 *               - fieldOfStudy
 *               - educationLevel
 *               - startDate
 *             properties:
 *               institution:
 *                 type: string
 *                 example: Chandigarh University
 *               degree:
 *                 type: string
 *                 example: MCA
 *               fieldOfStudy:
 *                 type: string
 *                 example: Computer Applications
 *               educationLevel:
 *                 type: string
 *                 example: high-school,diploma,bachelor,master,phd,certification,other
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               currentlyStudying:
 *                 type: boolean
 *                 example: true
 *               grade:
 *                 type: string
 *                 example: 8.5 CGPA
 *
 *     responses:
 *       201:
 *         description: Education added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Education'
 *
 *       400:
 *         description: Validation Error
 *
 *       401:
 *         description: Unauthorized
 *
 *       409:
 *         description: Education record already exists
 */

/**
 * @swagger
 * /api/v1/education/{id}:
 *   put:
 *     summary: Update Education Record
 *     tags: [Education]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Education ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               institution:
 *                 type: string
 *               degree:
 *                 type: string
 *               fieldOfStudy:
 *                 type: string
 *               educationLevel:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               currentlyStudying:
 *                 type: boolean
 *               grade:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Education updated successfully
 *
 *       403:
 *         description: Not authorized
 *
 *       404:
 *         description: Education record not found
 */

/**
 * @swagger
 * /api/v1/education/{id}:
 *   delete:
 *     summary: Delete Education Record
 *     tags: [Education]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Education ID
 *
 *     responses:
 *       200:
 *         description: Education deleted successfully
 *
 *       403:
 *         description: Not authorized
 *
 *       404:
 *         description: Education record not found
 */