import { Router } from "express";
import { checkIn, checkOut, getMyTodayAttendance } from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all attendance routes
router.use(verifyJWT);

// Employee actions
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/me/today", getMyTodayAttendance);

export default router;
