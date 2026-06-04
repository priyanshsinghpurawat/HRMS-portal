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
 *     summary: Get Logged In User Profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *
 *       404:
 *         description: Profile not found
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: MERN Stack Developer
 *
 *               about:
 *                 type: string
 *                 example: Passionate Full Stack Developer
 *
 *               gender:
 *                 type: string
 *                 example: male
 *
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["english","hindi"]
 *
 *               experienceLevel:
 *                 type: string
 *                 example: fresher
 *
 *               location:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                   state:
 *                     type: string
 *                   city:
 *                     type: string
 *                   address:
 *                     type: string
 *                   pincode:
 *                     type: string
 *
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   linkedin:
 *                     type: string
 *                   github:
 *                     type: string
 *                   portfolio:
 *                     type: string
 *
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /api/v1/profile/image:
 *   put:
 *     summary: Upload or Update Profile Image
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - profileImage
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Profile image updated successfully
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
 *     summary: Upload or Update Resume
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
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