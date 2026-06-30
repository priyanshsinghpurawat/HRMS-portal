import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { USER_ROLES } from "../constants/index.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { 
    hrMarkAttendanceSchema, 
    hrUpdateAttendanceSchema, 
    hrBulkAttendanceSchema 
} from "../validations/attendance.validation.js";
import { 
    hrMarkRecord, 
    hrUpdateRecord, 
    hrGetRecord, 
    hrQueryRecords, 
    hrBulkRecords 
} from "../controllers/attendance.controller.js";

const router = Router();

// Protect all HR attendance routes
router.use(verifyJWT, authorizeRoles(USER_ROLES.COMPANY, USER_ROLES.HR));

// --- HR Attendance Management APIs ---

router.route("/")
    .post(validateRequest(hrMarkAttendanceSchema), hrMarkRecord)
    .get(hrQueryRecords);

router.route("/bulk")
    .post(validateRequest(hrBulkAttendanceSchema), hrBulkRecords);

router.route("/:attendanceId")
    .get(hrGetRecord)
    .patch(validateRequest(hrUpdateAttendanceSchema), hrUpdateRecord);

export default router;
