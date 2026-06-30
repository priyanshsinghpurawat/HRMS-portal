import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { 
    generatePayslipSchema, 
    publishPayslipSchema
} from "../validations/payslip.validation.js";
import { 
    generatePayslip,
    publishPayslip,
    getAllPayslips,
    getPayslipById,
    getMyPayslips,
    getMyPayslipById,
    downloadPayslipPdf
} from "../controllers/payslip.controller.js";

// Export separate routers for Company/HR and Employee
export const companyPayslipRouter = Router();
export const employeePayslipRouter = Router();

// ==========================================
// 1. Company / HR Management Routes
// ==========================================
companyPayslipRouter.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

companyPayslipRouter.route("/generate")
    .post(validateRequest(generatePayslipSchema), generatePayslip);

companyPayslipRouter.route("/publish")
    .post(validateRequest(publishPayslipSchema), publishPayslip);

companyPayslipRouter.route("/")
    .get(getAllPayslips);

companyPayslipRouter.route("/:payslipId")
    .get(getPayslipById);

// HR PDF Download (e.g. for re-printing)
companyPayslipRouter.route("/:payslipId/download")
    .get(downloadPayslipPdf);


// ==========================================
// 2. Employee Self Service Routes
// ==========================================
employeePayslipRouter.use(verifyJWT, authorizeRoles(USER_ROLES.EMPLOYEE, USER_ROLES.COMPANY, USER_ROLES.HR));

employeePayslipRouter.route("/")
    .get(getMyPayslips);

employeePayslipRouter.route("/:payslipId")
    .get(getMyPayslipById);

employeePayslipRouter.route("/:payslipId/download")
    .get(downloadPayslipPdf);
