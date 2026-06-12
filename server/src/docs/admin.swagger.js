/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Management APIs
 */

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (role = user)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */

/**
 * @swagger
 * /api/v1/admin/users/active:
 *   get:
 *     summary: Get active users (role = user and not blocked)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active users fetched successfully
 */

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get single user (role = user)
 *     tags: [Admin]
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
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/admin/hrs:
 *   get:
 *     summary: Get all HRs (role = hr)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HRs fetched successfully
 */

/**
 * @swagger
 * /api/v1/admin/hrs/{id}:
 *   get:
 *     summary: Get single HR (role = hr)
 *     tags: [Admin]
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
 *         description: HR fetched successfully
 *       404:
 *         description: HR user not found
 */

/**
 * @swagger
 * /api/v1/admin/companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Companies fetched successfully
 */

/**
 * @swagger
 * /api/v1/admin/companies/active:
 *   get:
 *     summary: Get active companies (not blocked)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active companies fetched successfully
 */

/**
 * @swagger
 * /api/v1/admin/companies/blocked:
 *   get:
 *     summary: Get blocked companies (isBlocked = true)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blocked companies fetched successfully
 */

/**
 * @swagger
 * /api/v1/admin/companies/{id}:
 *   get:
 *     summary: Get single company
 *     tags: [Admin]
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
 *         description: Company fetched successfully
 *       404:
 *         description: Company not found
 */

/**
 * @swagger
 * /api/v1/admin/companies/block/{id}:
 *   patch:
 *     summary: Block a company
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *                 example: "Fraudulent Job Postings or Spam Activities"
 *     responses:
 *       200:
 *         description: Company blocked successfully
 *       400:
 *         description: Invalid input or missing reason
 *       404:
 *         description: Company not found
 */

/**
 * @swagger
 * /api/v1/admin/companies/unblock/{id}:
 *   patch:
 *     summary: Unblock a company
 *     tags: [Admin]
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
 *         description: Company unblocked successfully
 *       404:
 *         description: Company not found
 */

/**
 * @swagger
 * /api/v1/admin/companies/{id}:
 *   delete:
 *     summary: Delete a company
 *     tags: [Admin]
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
 *         description: Company deleted successfully
 *       404:
 *         description: Company not found
 */