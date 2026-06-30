import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createSalarySchema, revisionSalarySchema } from "../validations/salary.validation.js";
import { 
    createSalary, 
    getCurrentSalary, 
    createRevision, 
    getHistory 
} from "../controllers/salary.controller.js";

// Note: { mergeParams: true } allows accessing :employeeId from the parent router (app.js)
const router = Router({ mergeParams: true });

// Middleware: ensure user is authenticated and is a Company Admin or HR
router.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

// --- Salary Structure Routes ---
router.route("/")
    .post(validateRequest(createSalarySchema), createSalary)
    .get(getCurrentSalary);

router.route("/revision")
    .post(validateRequest(revisionSalarySchema), createRevision);

router.route("/history")
    .get(getHistory);

export default router;
