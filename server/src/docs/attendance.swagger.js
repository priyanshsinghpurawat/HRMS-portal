/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance tracking and management API.
 */

/**
 * @swagger
 * /api/v1/attendance/check-in:
 *   post:
 *     summary: Employee checks in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checked in successfully
 */

/**
 * @swagger
 * /api/v1/attendance/check-out:
 *   patch:
 *     summary: Employee checks out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checked out successfully
 */

/**
 * @swagger
 * /api/v1/company/attendance/mark:
 *   post:
 *     summary: HR manually marks attendance for an employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - date
 *               - status
 *             properties:
 *               employeeId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 */
