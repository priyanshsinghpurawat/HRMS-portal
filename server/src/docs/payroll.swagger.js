/**
 * @swagger
 * tags:
 *   name: Payroll Engine
 *   description: Immutable Payroll Generation and Calculation API.
 */

/**
 * @swagger
 * /api/v1/company/payroll/generate:
 *   post:
 *     summary: Generate monthly payroll for an employee
 *     tags: [Payroll Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payrollMonth
 *               - payrollYear
 *               - employeeId
 *             properties:
 *               payrollMonth:
 *                 type: number
 *               payrollYear:
 *                 type: number
 *               employeeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payroll snapshot generated successfully
 *       400:
 *         description: Payroll already exists for this period
 *       404:
 *         description: Employee, Salary Structure, or Attendance not found
 */

/**
 * @swagger
 * /api/v1/company/payroll/bulk:
 *   post:
 *     summary: Generate monthly payroll for entire company
 *     tags: [Payroll Engine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payrollMonth
 *               - payrollYear
 *             properties:
 *               payrollMonth:
 *                 type: number
 *               payrollYear:
 *                 type: number
 *     responses:
 *       200:
 *         description: Bulk payroll generation initiated successfully
 */
