/**
 * @swagger
 * tags:
 *   name: Reports & Analytics
 *   description: API for fetching payroll dashboards, statutory reports, and exports.
 */

/**
 * @swagger
 * /api/v1/company/reports/dashboard:
 *   get:
 *     summary: Get top-level payroll dashboard metrics
 *     tags: [Reports & Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: number
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 */

/**
 * @swagger
 * /api/v1/company/reports/export:
 *   get:
 *     summary: Export payroll register as CSV or XLSX
 *     tags: [Reports & Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: exportType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, xlsx]
 *     responses:
 *       200:
 *         description: Stream of the generated export file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
