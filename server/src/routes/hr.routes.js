import express from "express";
import { getHRProfile, updateHRProfile } from "../controllers/hr.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateHRSchema } from "../validations/company.validation.js";

const router = express.Router();

// Apply authentication and HR role authorization to all profile routes
router.use(verifyJWT, authorizeRoles("hr"));

router.route("/profile")
    .get(getHRProfile)
    .put(validate(updateHRSchema), updateHRProfile);

export default router;
