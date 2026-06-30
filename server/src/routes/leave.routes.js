import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { 
    createLeavePolicySchema, 
    updateLeavePolicySchema, 
    requestLeaveSchema, 
    approveRejectLeaveSchema 
} from "../validations/leave.validation.js";
import { 
    createPolicy, 
    updatePolicy, 
    getPolicies,
    getAllLeaves,
    approveRejectLeave,
    getEmployeeBalance,
    applyForLeave,
    getMyLeaves,
    cancelMyLeave
} from "../controllers/leave.controller.js";

// We'll export three distinct routers to mount cleanly in app.js
export const companyPolicyRouter = Router();
export const hrLeaveRouter = Router();
export const employeeLeaveRouter = Router();

// ==========================================
// 1. Company Leave Policy Routes (HR/Admin)
// ==========================================
companyPolicyRouter.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

companyPolicyRouter.route("/")
    .post(validateRequest(createLeavePolicySchema), createPolicy)
    .get(getPolicies);

companyPolicyRouter.route("/:policyId")
    .patch(validateRequest(updateLeavePolicySchema), updatePolicy);


// ==========================================
// 2. HR Leave Management Routes
// ==========================================
hrLeaveRouter.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

hrLeaveRouter.route("/")
    .get(getAllLeaves);

hrLeaveRouter.route("/:leaveId")
    .patch(validateRequest(approveRejectLeaveSchema), approveRejectLeave);


// Balance check (e.g. /api/v1/company/employees/:employeeId/leave-balance)
// We'll export a specific router for this that gets mounted at /api/v1/company/employees
export const employeeBalanceRouter = Router({ mergeParams: true });
employeeBalanceRouter.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));
employeeBalanceRouter.route("/leave-balance").get(getEmployeeBalance);


// ==========================================
// 3. Employee Leave Request Routes
// ==========================================
employeeLeaveRouter.use(verifyJWT, authorizeRoles(USER_ROLES.EMPLOYEE, USER_ROLES.COMPANY, USER_ROLES.HR));

employeeLeaveRouter.route("/")
    .post(validateRequest(requestLeaveSchema), applyForLeave)
    .get(getMyLeaves);

employeeLeaveRouter.route("/:leaveId")
    .delete(cancelMyLeave);
