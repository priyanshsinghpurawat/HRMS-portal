import { Router } from "express";
import { setupGeofence, getGeofences } from "../controllers/geofence.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all geofence routes
router.use(verifyJWT);

router.post("/", setupGeofence);
router.get("/:companyId", getGeofences);

export default router;
