import { Router } from "express";
import { getHealthStatus, getMetrics } from "../controllers/health.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";

const router = Router();

// Public health check for load balancers (AWS ALB, Nginx, etc.)
router.route("/").get(getHealthStatus);

// Protected metrics route
router.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));
router.route("/metrics").get(getMetrics);

export default router;
