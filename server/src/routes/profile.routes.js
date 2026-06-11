import { Router } from "express";
import { 
    updateProfile, 
    getProfile, 
    updateProfileImage, 
    deleteProfileImage, 
    updateResume, 
    deleteResume 
} from "../controllers/profile.controller.js";
import { uploadProfileFields, uploadImage, uploadResume } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateProfileSchema } from "../validations/profile.validation.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); 

const parseAndCleanProfileBody = (req, res, next) => {
    // Helper to recursively remove empty strings, nulls, and empty objects
    const cleanEmptyFields = (obj) => {
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
            for (const key of Object.keys(obj)) {
                if (obj[key] === null || obj[key] === "") {
                    delete obj[key];
                } else if (typeof obj[key] === "object") {
                    cleanEmptyFields(obj[key]);
                    if (Object.keys(obj[key]).length === 0) {
                        delete obj[key];
                    }
                }
            }
        }
    };

    // Parse JSON fields if they are sent as strings
    const jsonFields = ["location"];
    for (const field of jsonFields) {
        if (req.body[field] && typeof req.body[field] === "string") {
            try {
                req.body[field] = JSON.parse(req.body[field]);
            } catch (err) {
                // Keep as string if parsing fails, cleanEmptyFields will handle it
            }
        }
    }

    // Parse socialLinks from string, array, or object format
    if (req.body.socialLinks) {
        let rawLinks = req.body.socialLinks;
        let linksObj = {};

        if (typeof rawLinks === "string") {
            const trimmed = rawLinks.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                    rawLinks = JSON.parse(trimmed);
                } catch (err) {
                    rawLinks = trimmed.replace(/[\[\]"']/g, "").split(",").map(s => s.trim()).filter(Boolean);
                }
            } else if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                try {
                    linksObj = JSON.parse(trimmed);
                    rawLinks = null; // already an object
                } catch (err) {
                    // fall back to treating it as array/string if JSON.parse fails
                    rawLinks = trimmed.split(",").map(s => s.trim()).filter(Boolean);
                }
            } else {
                rawLinks = trimmed.split(",").map(s => s.trim()).filter(Boolean);
            }
        }

        if (Array.isArray(rawLinks)) {
            rawLinks.forEach(url => {
                const lowerUrl = url.toLowerCase();
                if (lowerUrl.includes("linkedin.com")) {
                    linksObj.linkedin = url;
                } else if (lowerUrl.includes("github.com")) {
                    linksObj.github = url;
                } else if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
                    linksObj.twitter = url;
                } else if (lowerUrl.includes("blog") || lowerUrl.includes("medium.com") || lowerUrl.includes("dev.to") || lowerUrl.includes("substack.com")) {
                    linksObj.blog = url;
                } else {
                    linksObj.portfolio = url;
                }
            });
        } else if (rawLinks && typeof rawLinks === "object") {
            linksObj = rawLinks;
        }

        req.body.socialLinks = linksObj;
    }

    // Parse array fields (languages & skills) safely
    const arrayFields = ["languages", "skills"];
    for (const field of arrayFields) {
        if (req.body[field]) {
            if (typeof req.body[field] === "string") {
                const trimmed = req.body[field].trim();
                if (trimmed === "") {
                    req.body[field] = undefined;
                } else if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                    try {
                        req.body[field] = JSON.parse(trimmed);
                    } catch (err) {
                        req.body[field] = trimmed.replace(/[\[\]"']/g, "").split(",").map(s => s.trim()).filter(Boolean);
                    }
                } else {
                    req.body[field] = trimmed.split(",").map(s => s.trim()).filter(Boolean);
                }
            } else if (Array.isArray(req.body[field])) {
                req.body[field] = req.body[field].map(s => typeof s === "string" ? s.trim() : s).filter(Boolean);
            }
        }
    }

    // Clean up empty fields across the whole body
    cleanEmptyFields(req.body);

    next();
};

router.route("/")
    .get(getProfile)
    .put(
        uploadProfileFields.fields([
            { name: "profileImage", maxCount: 1 },
            { name: "resume", maxCount: 1 }
        ]),
        parseAndCleanProfileBody,
        validate(updateProfileSchema),
        updateProfile
    );

router.route("/image")
    .put(uploadImage.single("profileImage"), updateProfileImage)
    .delete(deleteProfileImage);

router.route("/resume")
    .put(uploadResume.single("resume"), updateResume)
    .delete(deleteResume);

export default router;
