import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { 
    generatePayrollSchema, 
    bulkGeneratePayrollSchema,
    updatePayrollStatusSchema
} from "../validations/payroll.validation.js";
import { 
    generatePayroll,
    bulkGeneratePayroll,
    getPayrolls,
    getPayrollById,
    updateStatus
} from "../controllers/payroll.controller.js";

const router = Router();

// Protect all company payroll routes
router.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

router.route("/generate")
    .post(validateRequest(generatePayrollSchema), generatePayroll);

router.route("/generate/bulk")
    .post(validateRequest(bulkGeneratePayrollSchema), bulkGeneratePayroll);

router.route("/")
    .get(getPayrolls);

router.route("/:payrollId")
    .get(getPayrollById);

// Update status generic endpoint (Approve, Lock, Unlock can all map here with different payload statuses)
router.route("/:payrollId/status")
    .patch(validateRequest(updatePayrollStatusSchema), updateStatus);

// Or specific endpoints as requested by user
router.route("/:payrollId/approve")
    .patch((req, res, next) => { req.body.status = 'Approved'; next(); }, updateStatus);

router.route("/:payrollId/lock")
    .patch((req, res, next) => { req.body.status = 'Locked'; next(); }, updateStatus);

router.route("/:payrollId/unlock")
    .patch((req, res, next) => { req.body.status = 'Generated'; next(); }, updateStatus);

export default router;
