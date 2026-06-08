import { Router } from "express";
import { updateProfile, getProfile } from "../controllers/profile.controller.js";
import { uploadProfileFields } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateProfileSchema } from "../validations/profile.validation.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); 

const parseBodyJson = (fields) => (req, res, next) => {
    for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === "string") {
            try {
                req.body[field] = JSON.parse(req.body[field]);
            } catch (err) {
                // Let validation schema handle formatting errors if any
            }
        }
    }
    next();
};

router.route("/")
    .get(getProfile)
    .put(
        uploadProfileFields.fields([
            { name: "profileImage", maxCount: 1 },
            { name: "resume", maxCount: 1 }
        ]),
        parseBodyJson(["location", "socialLinks", "languages"]),
        validate(updateProfileSchema),
        updateProfile
    );

export default router;
