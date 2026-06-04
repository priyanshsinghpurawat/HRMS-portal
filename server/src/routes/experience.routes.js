import express from "express";
import { createExperience, deleteExperience, getExperiences, updateExperience } from "../controllers/experience.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/").post(createExperience)
    .get(getExperiences);
router.route("/:experienceId").put(updateExperience)
    .delete(deleteExperience);
export default router;
