/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User Profile APIs
 */

/**
 * @swagger
 * /api/v1/profile:
 *   get:
 *     summary: Get User Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 */

/**
 * @swagger
 * /api/v1/profile:
 *   put:
 *     summary: Update User Profile
 *     tags: [Profile]
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
 *             properties:
 *               title:
 *                 type: string
 *
 *               about:
 *                 type: string
 *
 *               gender:
 *                 type: string
 *
 *               languages:
 *                 type: array
 *
 *                 items:
 *                   type: string
 *
 *               experienceLevel:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /api/v1/profile/image:
 *   put:
 *     summary: Upload Profile Image
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */


/**
 * @swagger
 * /api/v1/profile/image:
 *   delete:
 *     summary: Delete Profile Image
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Profile image deleted successfully
 */


/**
 * @swagger
 * /api/v1/profile/resume:
 *   put:
 *     summary: Upload Resume
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 */


/**
 * @swagger
 * /api/v1/profile/resume:
 *   delete:
 *     summary: Delete Resume
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Resume deleted successfully
 */


