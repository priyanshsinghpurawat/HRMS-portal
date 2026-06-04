/**
 * @swagger
 * tags:
 *   name: Certification
 *   description: Certification Management APIs
 */


/**
 * @swagger
 * /api/v1/certificates:
 *   post:
 *     summary: Create Certification
 *     tags: [Certification]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - certificationName
 *               - issuingOrganization
 *               - issueDate
 *
 *             properties:
 *               certificationName:
 *                 type: string
 *
 *               issuingOrganization:
 *                 type: string
 *
 *               issueDate:
 *                 type: string
 *                 format: date
 *
 *               expirationDate:
 *                 type: string
 *                 format: date
 *
 *               doesNotExpire:
 *                 type: boolean
 *
 *               credentialId:
 *                 type: string
 *
 *               credentialUrl:
 *                 type: string
 *
 *               description:
 *                 type: string
 *
 *               certificate:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       201:
 *         description: Certification created successfully
 *
 *       400:
 *         description: Validation Error
 *
 *       401:
 *         description: Unauthorized
 *
 *       409:
 *         description: Certification already exists
 */


/**
 * @swagger
 * /api/v1/certificates/{certificationId}:
 *   put:
 *     summary: Update Certification
 *     tags: [Certification]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: certificationId
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *
 *             properties:
 *               certificationName:
 *                 type: string
 *
 *               issuingOrganization:
 *                 type: string
 *
 *               issueDate:
 *                 type: string
 *                 format: date
 *
 *               expirationDate:
 *                 type: string
 *                 format: date
 *
 *               doesNotExpire:
 *                 type: boolean
 *
 *               credentialId:
 *                 type: string
 *
 *               credentialUrl:
 *                 type: string
 *
 *               description:
 *                 type: string
 *
 *               certificate:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Certification updated successfully
 *
 *       403:
 *         description: Not authorized
 *
 *       404:
 *         description: Certification not found
 */


/**
 * @swagger
 * /api/v1/certificates/{certificationId}:
 *   delete:
 *     summary: Delete Certification
 *     tags: [Certification]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: certificationId
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Certification deleted successfully
 *
 *       403:
 *         description: Not authorized
 *
 *       404:
 *         description: Certification not found
 */


