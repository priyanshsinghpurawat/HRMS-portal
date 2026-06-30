import express from "express";
import { createFeedback, getCompanyFeedbacks } from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createFeedbackSchema } from "../validations/feedback.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: API for managing company feedback to the platform
 */

/**
 * @swagger
 * /api/v1/feedback:
 *   get:
 *     summary: Get all feedbacks of companies given to the platform (Public - No auth required)
 *     tags: [Feedback]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional company ID to filter feedback by a specific company
 *     responses:
 *       200:
 *         description: Company feedbacks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109ca"
 *                       title:
 *                         type: string
 *                         example: "Great Platform"
 *                       description:
 *                         type: string
 *                         example: "The hiring process was smooth and the UI is intuitive."
 *                       rating:
 *                         type: integer
 *                         example: 5
 *                       companyId:
 *                         type: string
 *                         example: "60d0fe4f5311236168a109ca"
 *                       companyName:
 *                         type: string
 *                         example: "Feedback Corp"
 *                       companyProfilePhoto:
 *                         type: string
 *                         example: "https://res.cloudinary.com/.../image.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *                   example: "Company feedbacks retrieved successfully"
 *                 success:
 *                   type: boolean
 *                   example: true
 */
// Public route — no authentication required (for landing page)
router.route("/").get(getCompanyFeedbacks);

/**
 * @swagger
 * /api/v1/feedback:
 *   post:
 *     summary: Post Feedback to the platform (Company role only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - rating
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Great Platform"
 *               description:
 *                 type: string
 *                 example: "The hiring process was smooth and the UI is intuitive."
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               companyID:
 *                 type: string
 *                 description: ID of the company giving the feedback
 *                 example: "60d0fe4f5311236168a109ca"
 *               companyId:
 *                 type: string
 *                 description: Alternative ID of the company giving the feedback
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Validation Error
 *       401:
 *         description: Unauthorized request / Invalid Access Token
 *       403:
 *         description: Not authorized to post feedback for this company / Access Denied
 */
// Protected route — requires company role
router.route("/").post(
    verifyJWT,
    authorizeRoles("company"),
    validate(createFeedbackSchema),
    createFeedback
);

export default router;
