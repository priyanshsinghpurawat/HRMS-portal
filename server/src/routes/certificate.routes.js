import express from "express";
import { createCertification, deleteCertification, updateCertification } from "../controllers/certificate.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadCertificate } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.use(verifyJWT);
router.route("/").post(uploadCertificate.single("certificate"), createCertification)
router.route("/:certificationId").put(uploadCertificate.single("certificate"), updateCertification)
    .delete(deleteCertification);

export default router;