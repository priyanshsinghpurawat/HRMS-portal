/**
 * @swagger
 * tags:
 *   name: Automation & Workflow
 *   description: Immutable strict-state payroll workflow and auditing API.
 */

/**
 * @swagger
 * /api/v1/company/automation/{payrollId}/status:
 *   patch:
 *     summary: Transition a payroll to a new workflow state
 *     tags: [Automation & Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payrollId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Generated, Under Review, Approved, Locked, Payslip Generated, Published, Salary Released, Completed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: State transitioned successfully and audit log generated
 *       400:
 *         description: Invalid state transition
 */

/**
 * @swagger
 * /api/v1/company/automation/audit:
 *   get:
 *     summary: Retrieve the immutable audit trail for a payroll
 *     tags: [Automation & Workflow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: payrollId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
