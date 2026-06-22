import { Router } from "express";
import { checkIn, checkOut, getMyTodayAttendance, requestLeave, getLeaveRequests, updateLeaveStatus } from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all attendance routes
router.use(verifyJWT);

// Employee actions
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/me/today", getMyTodayAttendance);

// Leave requests
router.post("/leave", requestLeave);
router.get("/leaves", getLeaveRequests); // For HR
router.put("/leave/:id", updateLeaveStatus); // For HR

export default router;
