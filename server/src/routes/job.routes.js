import express from "express";
import {
    createJob,
    getMyJobs,
    getJobById,
    updateJob,
    closeJob,
    reopenJob,
    deleteJob,
    getPublicActiveJobs,
    getPublicJobDetails
} from "../controllers/job.controller.js";
import { applyToJob } from "../controllers/application.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadResume } from "../middlewares/multer.middleware.js";
import { createJobSchema, updateJobSchema } from "../validations/job.validation.js";
import { applySchema } from "../validations/application.validation.js";

const router = express.Router();

// Public Candidate Routes
router.route("/").get(getPublicActiveJobs);
router.route("/:id/public").get(getPublicJobDetails);

// Candidate Apply Route
router.route("/:jobId/apply").post(
    verifyJWT,
    uploadResume.single("resume"),
    validate(applySchema),
    applyToJob
);

// HR Authenticated Routes
router.route("/")
    .post(verifyJWT, authorizeRoles("hr"), validate(createJobSchema), createJob);

router.route("/my-jobs")
    .get(verifyJWT, authorizeRoles("hr"), getMyJobs);

router.route("/:id")
    .get(verifyJWT, authorizeRoles("hr"), getJobById)
    .put(verifyJWT, authorizeRoles("hr"), validate(updateJobSchema), updateJob)
    .delete(verifyJWT, authorizeRoles("hr"), deleteJob);

router.route("/:id/close")
    .patch(verifyJWT, authorizeRoles("hr"), closeJob);

router.route("/:id/reopen")
    .patch(verifyJWT, authorizeRoles("hr"), reopenJob);

export default router;
