import { Router } from "express";
import {
    getMyApplications,
    getApplicationDetails,
    getJobApplicationsHR,
    updateApplicationStatusHR,
    updateApplicationQueueHR
} from "../controllers/application.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    updateStatusSchema,
    updateQueueSchema
} from "../validations/application.validation.js";

const router = Router();

// Apply JWT verification across all application routes
router.use(verifyJWT);

// ==========================================
// Candidate Routes
// ==========================================
router.route("/my-applications").get(getMyApplications);
router.route("/:id").get(getApplicationDetails);

// ==========================================
// HR Routes
// ==========================================
router.route("/hr/jobs/:jobId/applications").get(
    authorizeRoles("hr"),
    getJobApplicationsHR
);

router.route("/hr/applications/:id/status").patch(
    authorizeRoles("hr"),
    validate(updateStatusSchema),
    updateApplicationStatusHR
);

router.route("/hr/applications/:id/queue").patch(
    authorizeRoles("hr"),
    validate(updateQueueSchema),
    updateApplicationQueueHR
);

export default router;
