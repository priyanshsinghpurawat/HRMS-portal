/**
 * @swagger
 * tags:
 *   name: Job
 *   description: Job Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - company
 *         - title
 *         - description
 *         - experienceLevel
 *         - location
 *         - postedBy
 *       properties:
 *         _id:
 *           type: string
 *           example: "60d5ec49c6158e00155b4124"
 *         company:
 *           type: string
 *           description: Company ID
 *           example: "60d5ec49c6158e00155b4123"
 *         title:
 *           type: string
 *           example: "Software Engineer"
 *         description:
 *           type: string
 *           example: "We are looking for a skilled Software Engineer to join our team."
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           example: ["3+ years experience with React", "Proficiency in Node.js", "Familiarity with MongoDB"]
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *             description: Skill ID
 *           example: ["60d5ec49c6158e00155b4129"]
 *         experienceLevel:
 *           type: string
 *           example: "1-3 years"
 *         location:
 *           type: string
 *           example: "Bangalore, India"
 *         jobType:
 *           type: string
 *           enum: [full-time, part-time, contract, internship, freelance]
 *           example: "full-time"
 *         salaryRange:
 *           type: object
 *           properties:
 *             min:
 *               type: number
 *               example: 500000
 *             max:
 *               type: number
 *               example: 800000
 *             currency:
 *               type: string
 *               example: "INR"
 *         status:
 *           type: string
 *           enum: [active, closed, draft]
 *           example: "active"
 *         postedBy:
 *           type: string
 *           description: User ID of the job poster
 *           example: "60d5ec49c6158e00155b4125"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
