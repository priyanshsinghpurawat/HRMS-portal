import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { getReportsSchema } from "../validations/reports.validation.js";
import { 
    getDashboard,
    getAnalytics,
    getPayrollReport,
    getEmployeeReport,
    getStatutoryPF,
    getStatutoryESIC,
    getStatutoryPT,
    getStatutoryTDS,
    exportReport
} from "../controllers/reports.controller.js";

const router = Router();

// Protect all reporting routes - typically restricted to HR and Company Admins
router.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

// Dashboard & Analytics
router.route("/dashboard").get(validateRequest(getReportsSchema), getDashboard);
router.route("/analytics").get(validateRequest(getReportsSchema), getAnalytics);

// Payroll Reports
router.route("/payroll").get(validateRequest(getReportsSchema), getPayrollReport);
router.route("/employees/:employeeId").get(getEmployeeReport);

// Statutory Reports
router.route("/statutory/pf").get(validateRequest(getReportsSchema), getStatutoryPF);
router.route("/statutory/esic").get(validateRequest(getReportsSchema), getStatutoryESIC);
router.route("/statutory/pt").get(validateRequest(getReportsSchema), getStatutoryPT);
router.route("/statutory/tds").get(validateRequest(getReportsSchema), getStatutoryTDS);

// Export
router.route("/export").get(validateRequest(getReportsSchema), exportReport);

export default router;
