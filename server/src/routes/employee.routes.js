import { Router } from "express";
import {
    getEmployees,
    getEmployeeById,
    updateEmployeeHR,
    deactivateEmployee,
    terminateEmployee,
    getEmployeeProfile,
    updateEmployeeProfile,
    createEmployee,
    activateEmployee,
    deleteEmployee
} from "../controllers/employee.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
    updateEmployeeHRSchema,
    updateEmployeeSelfSchema,
    createEmployeeSchema
} from "../validations/employee.validation.js";

const hrRouter = Router();
const selfRouter = Router();

// HR Employees Plural routes (/api/v1/employees)
hrRouter.use(verifyJWT, authorizeRoles("hr"));
hrRouter.route("/")
    .get(getEmployees)
    .post(validate(createEmployeeSchema), createEmployee);

hrRouter.route("/:id")
    .get(getEmployeeById)
    .put(validate(updateEmployeeHRSchema), updateEmployeeHR)
    .delete(deleteEmployee);

hrRouter.route("/:id/deactivate").patch(deactivateEmployee);
hrRouter.route("/:id/terminate").patch(terminateEmployee);
hrRouter.route("/:id/activate").patch(activateEmployee);

// Employee Self Singular routes (/api/v1/employee)
selfRouter.use(verifyJWT, authorizeRoles("employee"));
selfRouter.route("/profile").get(getEmployeeProfile).put(validate(updateEmployeeSelfSchema), updateEmployeeProfile);

export { hrRouter as employeeHRRouter, selfRouter as employeeSelfRouter };
