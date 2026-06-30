import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { 
    updatePayrollStatusSchema,
    approvePayrollSchema
} from "../validations/automation.validation.js";
import { 
    updatePayrollSchedule,
    updateStatus,
    approve,
    reject,
    lock,
    unlock,
    getAuditLogs,
    getNotifications
} from "../controllers/automation.controller.js";

const router = Router();

// Protect all automation routes
router.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

// --- Scheduler ---
// Note: Normally we'd use a schedule validation schema here
router.route("/schedule").post(updatePayrollSchedule);

// --- Workflow Transitions ---
router.route("/:payrollId/status")
    .patch(validateRequest(updatePayrollStatusSchema), updateStatus);

router.route("/:payrollId/approve")
    .patch(validateRequest(approvePayrollSchema), approve);

router.route("/:payrollId/reject")
    .patch(reject);

router.route("/:payrollId/lock")
    .patch(lock);

router.route("/:payrollId/unlock")
    .patch(unlock);

// --- Notifications & Audit ---
router.route("/notifications")
    .get(getNotifications);

router.route("/audit")
    .get(getAuditLogs);

export default router;
