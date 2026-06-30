import { Router } from "express";
import {
    createOffer,
    getOfferById,
    getMyOffers,
    resendOffer,
    acceptOffer,
    rejectOffer
} from "../controllers/offer.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadResume } from "../middlewares/multer.middleware.js";
import { createOfferSchema } from "../validations/offer.validation.js";

const router = Router();

// Apply JWT verification globally across offers
router.use(verifyJWT);

// Candidate Offer List
router.route("/my-offers").get(getMyOffers);

// HR Offer Creation (supports pdf file upload via field key 'offerLetter')
router.route("/").post(
    authorizeRoles("hr"),
    uploadResume.single("offerLetter"),
    validate(createOfferSchema),
    createOffer
);

router.route("/:id").get(authorizeRoles("hr", "company", "employee"), getOfferById);

// HR Resend Offer
router.route("/:id/resend").post(
    authorizeRoles("hr"),
    resendOffer
);

// Candidate Accept/Reject Offer
router.route("/:id/accept").patch(authorizeRoles("employee"), acceptOffer);
router.route("/:id/reject").patch(authorizeRoles("employee"), rejectOffer);

export default router;
