/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company Profile Management APIs
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
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49c6158e00155b4123"
 *         name:
 *           type: string
 *           example: "Google Inc."
 *         description:
 *           type: string
 *           example: "A multinational technology company specializing in internet-related services."
 *         logo:
 *           type: string
 *           example: "https://cloudinary.com/logo.png"
 *         website:
 *           type: string
 *           example: "https://google.com"
 *         location:
 *           type: object
 *           properties:
 *             country:
 *               type: string
 *               example: "USA"
 *             state:
 *               type: string
 *               example: "California"
 *             city:
 *               type: string
 *               example: "Mountain View"
 *             address:
 *               type: string
 *               example: "1600 Amphitheatre Parkway"
 *             pincode:
 *               type: string
 *               example: "94043"
 *         socialLinks:
 *           type: object
 *           properties:
 *             linkedin:
 *               type: string
 *               example: "https://linkedin.com/company/google"
 *         tanId:
 *           type: string
 *           example: "ABCD12345E"
 *         gstId:
 *           type: string
 *           example: "22AAAAA1111A1Z1"
 *         isVerified:
 *           type: string
 *           enum: [pending, fullfield, reject]
 *           example: "pending"
 *         isActive:
 *           type: boolean
 *           example: false
 *         isProfileCompleted:
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
 * /api/v1/company/companyprofile:
 *   post:
 *     summary: Create Company Profile
 *     tags: [Company]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - tanId
 *               - gstId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Google Inc."
 *               description:
 *                 type: string
 *                 example: "A multinational technology company."
 *               website:
 *                 type: string
 *                 example: "https://google.com"
 *               location:
 *                 type: object
 *                 properties:
 *                   country:
 *                     type: string
 *                     example: "USA"
 *                   state:
 *                     type: string
 *                     example: "California"
 *                   city:
 *                     type: string
 *                     example: "Mountain View"
 *                   address:
 *                     type: string
 *                     example: "1600 Amphitheatre Parkway"
 *                   pincode:
 *                     type: string
 *                     example: "94043"
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   linkedin:
 *                     type: string
 *                     example: "https://linkedin.com/company/google"
 *               tanId:
 *                 type: string
 *                 example: "ABCD12345E"
 *               gstId:
 *                 type: string
 *                 example: "22AAAAA1111A1Z1"
 *     responses:
 *       201:
 *         description: Company profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       400:
 *         description: Validation Error
 *       409:
 *         description: Conflict - Company name, website, TAN ID, or GST ID already exists
 */
