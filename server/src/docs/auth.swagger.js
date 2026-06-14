/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@gmail.com
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               password:
 *                 type: string
 *                 example: Password@123
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Logout successful
 */

/**
 * @swagger
 * /api/v1/auth/current-user:
 *   get:
 *     summary: Get current logged-in user details
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Current user details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/auth/google:
 *   post:
 *     summary: Authenticate user via Google OAuth 2.0
 *     description: Sign in or sign up using a Google ID token. Automatically registers new candidates with default roles and connects existing manual accounts.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The Google ID token received after user authentication on client-side.
 *                 example: google_id_token_xyz
 *     responses:
 *       200:
 *         description: Google login successful. Access and refresh tokens returned and cookies set.
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
 *                   example: Google login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Invalid Google ID token or verification failure.
 *       403:
 *         description: HR account is inactive.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /api/v1/auth/change-password:
 *   post:
 *     summary: Change password for logged-in user
 *     description: Allows authenticated users to change their account password.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The current password of the user.
 *                 example: OldPassword@123
 *               newPassword:
 *                 type: string
 *                 description: The new password to be set (must be at least 8 characters).
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Old password is incorrect or validation failed
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */