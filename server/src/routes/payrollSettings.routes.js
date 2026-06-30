import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createPayrollSettingSchema, updatePayrollSettingSchema, holidaySchema } from "../validations/payrollSettings.validation.js";
import { 
    createSettings, 
    getSettings, 
    updateSettings, 
    addHoliday, 
    updateHoliday, 
    removeHoliday 
} from "../controllers/payrollSettings.controller.js";

const router = Router();

// Middleware: ensure user is authenticated and is a Company Admin
router.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY));

// --- Payroll Settings Routes ---
router.route("/")
    .get(getSettings)
    .post(validateRequest(createPayrollSettingSchema), createSettings)
    .patch(validateRequest(updatePayrollSettingSchema), updateSettings);

// --- Public Holidays Routes ---
router.route("/holidays")
    .post(validateRequest(holidaySchema), addHoliday);

router.route("/holidays/:holidayId")
    .patch(validateRequest(holidaySchema), updateHoliday)
    .delete(removeHoliday);

export default router;
