/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Company Employee Administration & Self-Profile management APIs
 */

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: Retrieve company employees list (HR Only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   get:
 *     summary: Retrieve specific company employee profile (HR Only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       403:
 *         description: Access Denied
 *       404:
 *         description: Employee record not found
 */

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   put:
 *     summary: Modify employee department, designation or manager (HR Only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department:
 *                 type: string
 *               designation:
 *                 type: string
 *               reportingManager:
 *                 type: string
 *                 description: Employee ID of the manager
 *     responses:
 *       200:
 *         description: Employee record modified successfully
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/employees/{id}/deactivate:
 *   patch:
 *     summary: Deactivate employee status (HR Only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee deactivated successfully
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/employees/{id}/terminate:
 *   patch:
 *     summary: Terminate employee employment (HR Only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee terminated successfully
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/employee/profile:
 *   get:
 *     summary: View self employee profile details (Employee Only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee self-profile details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       403:
 *         description: Access Denied
 */

/**
 * @swagger
 * /api/v1/employee/profile:
 *   put:
 *     summary: Modify self phone, address or emergency contact (Employee Only)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               emergencyContact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Access Denied
 */
