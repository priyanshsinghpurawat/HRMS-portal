/**
 * @swagger
 * tags:
 *   name: Payslips
 *   description: Immutable Payslip Generation and Distribution API.
 */

/**
 * @swagger
 * /api/v1/company/payslips/generate/{payrollId}:
 *   post:
 *     summary: Generate a payslip from a locked payroll snapshot
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payrollId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Payslip generated successfully
 *       400:
 *         description: Payroll must be Locked or Paid to generate payslip
 */

/**
 * @swagger
 * /api/v1/payslips/{payslipId}/download:
 *   get:
 *     summary: Stream the payslip PDF to the client
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payslipId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF Buffer Stream
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
