import { Router } from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginRateLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.route("/register").post(validate(registerSchema), registerUser);
router.route("/login").post(loginRateLimiter, validate(loginSchema), loginUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/logout").post(verifyJWT, logoutUser);

export default router;
