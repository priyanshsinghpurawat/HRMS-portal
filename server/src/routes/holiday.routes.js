import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { 
    createHolidaySchema, 
    updateHolidaySchema 
} from "../validations/holiday.validation.js";
import { 
    createHoliday, 
    updateHoliday, 
    deleteHoliday, 
    queryHolidays 
} from "../controllers/holiday.controller.js";

const router = Router();

// Protect all company holiday routes
router.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

router.route("/")
    .post(validateRequest(createHolidaySchema), createHoliday)
    .get(queryHolidays);

router.route("/:holidayId")
    .patch(validateRequest(updateHolidaySchema), updateHoliday)
    .delete(deleteHoliday);

export default router;
