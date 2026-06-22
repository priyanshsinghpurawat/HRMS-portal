import { Router } from "express";
import { checkIn, checkOut, getMyTodayAttendance, requestLeave, getLeaveRequests, updateLeaveStatus } from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: API for managing employee attendance and leaves
 */

// Protect all attendance routes
router.use(verifyJWT);

/**
 * @swagger
 * /api/v1/attendance/check-in:
 *   post:
 *     summary: Employee Check-In
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
 *               - latitude
 *               - longitude
 *               - branchName
 *             properties:
 *               latitude:
 *                 type: number
 *                 example: 28.7041
 *               longitude:
 *                 type: number
 *                 example: 77.1025
 *               branchName:
 *                 type: string
 *                 example: "Head Office"
 *               deviceInfo:
 *                 type: string
 *                 example: "iPhone 13, iOS 16"
 *     responses:
 *       200:
 *         description: Checked in successfully
 *       400:
 *         description: Already checked in today
 *       403:
 *         description: Outside allowed office area
 */
router.post("/check-in", checkIn);

/**
 * @swagger
 * /api/v1/attendance/check-out:
 *   post:
 *     summary: Employee Check-Out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               deviceInfo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checked out successfully
 *       400:
 *         description: Not checked in or already checked out
 */
router.post("/check-out", checkOut);

/**
 * @swagger
 * /api/v1/attendance/me/today:
 *   get:
 *     summary: Get Employee's Today Attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's attendance retrieved successfully
 */
router.get("/me/today", getMyTodayAttendance);

/**
 * @swagger
 * /api/v1/attendance/leave:
 *   post:
 *     summary: Request a Leave (Employee)
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
 *               - date
 *               - reason
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-25"
 *               reason:
 *                 type: string
 *                 example: "Medical emergency"
 *     responses:
 *       201:
 *         description: Leave request submitted successfully
 */
router.post("/leave", requestLeave);

/**
 * @swagger
 * /api/v1/attendance/leaves:
 *   get:
 *     summary: View All Leave Requests (HR/Admin)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave requests retrieved
 */
router.get("/leaves", getLeaveRequests);

/**
 * @swagger
 * /api/v1/attendance/leave/{id}:
 *   put:
 *     summary: Approve or Reject a Leave Request (HR/Admin)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Leave Request ID
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
 *                 enum: [Approved, Rejected]
 *               hrComment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave request updated successfully
 */
router.put("/leave/:id", updateLeaveStatus);

export default router;
