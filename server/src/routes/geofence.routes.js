import { Router } from "express";
import { setupGeofence, getGeofences, deleteGeofence } from "../controllers/geofence.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Geofence
 *   description: API for managing office geofences
 */

// Protect all geofence routes
router.use(verifyJWT);

/**
 * @swagger
 * /api/v1/geofence:
 *   post:
 *     summary: Setup or Update a Geofence (HR/Admin)
 *     tags: [Geofence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - branchName
 *               - latitude
 *               - longitude
 *             properties:
 *               companyId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *               branchName:
 *                 type: string
 *                 example: "Head Office"
 *               latitude:
 *                 type: number
 *                 example: 28.7041
 *               longitude:
 *                 type: number
 *                 example: 77.1025
 *               allowedRadius:
 *                 type: number
 *                 example: 100
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Geofence updated successfully
 *       201:
 *         description: Geofence created successfully
 */
router.post("/", authorizeRoles("company", "hr", "admin"), setupGeofence);

/**
 * @swagger
 * /api/v1/geofence/{companyId}:
 *   get:
 *     summary: Get all Geofences for a Company (HR/Admin)
 *     tags: [Geofence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Geofences retrieved successfully
 */
router.get("/:companyId", authorizeRoles("company", "hr", "admin", "employee"), getGeofences);

/**
 * @swagger
 * /api/v1/geofence/{geofenceId}:
 *   delete:
 *     summary: Delete a Geofence (HR/Admin)
 *     tags: [Geofence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: geofenceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Geofence deleted successfully
 *       404:
 *         description: Geofence not found
 */
router.delete("/:geofenceId", authorizeRoles("company", "hr", "admin"), deleteGeofence);

export default router;
