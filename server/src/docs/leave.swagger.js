/**
 * @swagger
 * tags:
 *   name: Leave Management
 *   description: API for managing company leave policies, balances, and employee requests.
 */

/**
 * @swagger
 * /api/v1/company/leave-policies:
 *   post:
 *     summary: Create a new leave policy for the company
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - type
 *               - annualAllocation
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *               annualAllocation:
 *                 type: number
 *     responses:
 *       201:
 *         description: Leave policy created successfully
 *       400:
 *         description: Invalid input or duplicate code
 */

/**
 * @swagger
 * /api/v1/leaves/request:
 *   post:
 *     summary: Employee requests a leave
 *     tags: [Leave Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leavePolicyId
 *               - startDate
 *               - endDate
 *               - reason
 *             properties:
 *               leavePolicyId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave requested successfully
 *       400:
 *         description: Insufficient balance or overlapping leave
 */

/**
 * @swagger
 * /api/v1/company/leaves/{id}/approve:
 *   patch:
 *     summary: HR approves a leave request
 *     tags: [Leave Management]
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
 *         description: Leave approved successfully
 */
