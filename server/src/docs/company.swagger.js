/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company Profile Management, Verification, & HR Administration APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - name
 *         - tanId
 *         - gstId
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49c6158e00155b4123"
 *         name:
 *           type: string
 *           example: "TCS"
 *         email:
 *           type: string
 *           example: "tcs@company.com"
 *         description:
 *           type: string
 *           example: "Tata Consultancy Services is an IT services, consulting and business solutions organization."
 *         logo:
 *           type: string
 *           example: "https://cloudinary.com/logo.png"
 *         website:
 *           type: string
 *           example: "https://tcs.com"
 *         location:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *               example: "India"
 *             state:
 *               type: string
 *               example: "Punjab"
 *             city:
 *               type: string
 *               example: "Mohali"
 *             address:
 *               type: string
 *               example: "Sector 62"
 *             pincode:
 *               type: string
 *               example: "160062"
 *         socialLinks:
 *           type: object
 *           properties:
 *             linkedin:
 *               type: string
 *               example: "https://linkedin.com/company/tcs"
 *             twitter:
 *               type: string
 *               example: "https://twitter.com/tcs"
 *             blog:
 *               type: string
 *               example: "https://tcs.com/blog"
 *         tanId:
 *           type: string
 *           example: "TCSG12345Z"
 *         gstId:
 *           type: string
 *           example: "22TCSGG1234A1Z5"
 *         isEmailVerified:
 *           type: boolean
 *           example: true
 *         isBusinessVerified:
 *           type: boolean
 *           example: false
 *         isActive:
 *           type: boolean
 *           example: true
 *         isProfileCompleted:
 *           type: boolean
 *           example: true
 *         hrIds:
 *           type: array
 *           items:
 *             type: string
 *           example: ["60d5ec49c6158e00155b4125"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/company/register:
 *   post:
 *     summary: Register a new company account
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - tanId
 *               - gstId
 *             properties:
 *               email:
 *                 type: string
 *                 example: "tcs@company.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 example: "TCS"
 *               tanId:
 *                 type: string
 *                 example: "TCSG12345Z"
 *               gstId:
 *                 type: string
 *                 example: "22TCSGG1234A1Z5"
 *     responses:
 *       201:
 *         description: Company registered successfully. Verification OTP has been sent.
 *       400:
 *         description: Validation error or company name/GST/TAN already exists
 */

/**
 * @swagger
 * /api/v1/company/verify-email:
 *   post:
 *     summary: Verify company email with OTP
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: "tcs@company.com"
 *               otp:
 *                 type: string
 *                 example: "246876"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /api/v1/company/login:
 *   post:
 *     summary: Log in to a company account
 *     tags: [Company]
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
 *                 example: "tcs@company.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Please verify your email first
 *       401:
 *         description: Invalid email or password
 */

/**
 * @swagger
 * /api/v1/company/profile:
 *   get:
 *     summary: Retrieve company profile details (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/company/profile:
 *   put:
 *     summary: Update company profile details (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Company logo image (JPG, JPEG, PNG, WEBP)
 *               socialLinks:
 *                 type: string
 *                 description: JSON stringified object representing social links e.g. linkedin url
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/company/profile/{id}:
 *   get:
 *     summary: Retrieve public company profile details by ID
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company profile details retrieved
 *       404:
 *         description: Company profile not found
 */

/**
 * @swagger
 * /api/v1/company/hr:
 *   post:
 *     summary: Create a new HR account for the company (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personalEmail
 *               - name
 *               - category
 *             properties:
 *               personalEmail:
 *                 type: string
 *                 example: "harsh.jain@gmail.com"
 *               name:
 *                 type: string
 *                 example: "Harsh Jain"
 *               category:
 *                 type: string
 *                 enum: [technical, non-technical, senior-recruiter, manager]
 *                 example: "technical"
 *               designation:
 *                 type: string
 *                 example: "Recruiting Manager"
 *               phone:
 *                 type: string
 *                 example: "+919876543211"
 *     responses:
 *       201:
 *         description: HR user created successfully
 *       403:
 *         description: Access Denied or No Active Subscription
 */

/**
 * @swagger
 * /api/v1/company/hr:
 *   get:
 *     summary: List all HR profiles for the company (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HR list retrieved successfully
 */

/**
 * @swagger
 * /api/v1/company/hr/{id}:
 *   get:
 *     summary: Retrieve details of an HR profile (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: HR Profile ID
 *     responses:
 *       200:
 *         description: HR details retrieved successfully
 */

/**
 * @swagger
 * /api/v1/company/hr/{id}:
 *   put:
 *     summary: Update an HR profile's details (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: HR Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalEmail:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [technical, non-technical, senior-recruiter, manager]
 *               designation:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: HR profile updated successfully
 */

/**
 * @swagger
 * /api/v1/company/hr/{id}/activate:
 *   patch:
 *     summary: Activate an HR account (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: HR Profile ID
 *     responses:
 *       200:
 *         description: HR account activated successfully
 */

/**
 * @swagger
 * /api/v1/company/hr/{id}/deactivate:
 *   patch:
 *     summary: Deactivate an HR account (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: HR Profile ID
 *     responses:
 *       200:
 *         description: HR account deactivated successfully
 */

/**
 * @swagger
 * /api/v1/company/hr/{id}/reset-password:
 *   post:
 *     summary: Reset an HR account password (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: HR Profile ID
 *     responses:
 *       200:
 *         description: Password reset successfully, temp password sent to personal email
 */

/**
 * @swagger
 * /api/v1/company/hr/{id}:
 *   delete:
 *     summary: Delete an HR profile (Company Owner Only)
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: HR Profile ID
 *     responses:
 *       200:
 *         description: HR account deleted successfully
 */

/**
 * @swagger
 * /api/v1/company/send-verification:
 *   post:
 *     summary: Resend OTP verification email to company email
 *     description: Triggers sending a new 6-digit verification OTP to the company owner's email address.
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: Company owner email address
 *                 example: tcs@company.com
 *     responses:
 *       200:
 *         description: Verification email sent successfully
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
 *                   example: Verification email sent successfully
 *                 data:
 *                   type: object
 *                   example: {}
 *       400:
 *         description: Email is already verified or email field is missing
 *       404:
 *         description: User or company profile not found
 *       500:
 *         description: Internal Server Error
 *
 * /api/v1/company/jobs:
 *   get:
 *     summary: Retrieve company's job listings (Company Owner Only)
 *     description: Returns a list of all active (not deleted) job postings that belong to the authenticated company owner's company.
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company job listings fetched successfully
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
 *                   example: Company job listings fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Company profile not found
 *       500:
 *         description: Internal Server Error
 */

