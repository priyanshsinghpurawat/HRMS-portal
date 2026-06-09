import express from "express";
import { 
    companyRegister, 
    companyLogin, 
    createHR, 
    sendVerificationEmail, 
    verifyEmail, 
    createRazorpayOrder,
    verifyRazorpayPayment,
    getCurrentSubscription,
    updateCompanyProfile,
    getCompanyProfile,
    getCompanyProfileById,
    getCompanyHRs,
    getCompanyHRById,
    updateCompanyHR,
    activateHR,
    deactivateHR,
    resetHRPassword,
    deleteHR,
    getCompanyJobs
} from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { checkActiveSubscription } from "../middlewares/subscription.middleware.js";
import { uploadImage } from "../middlewares/multer.middleware.js";
import { 
    companyLoginSchema, 
    createHRSchema,
    createOrderSchema,
    verifyPaymentSchema,
    updateCompanyProfileSchema,
    updateHRSchema,
    resetHRPasswordSchema
} from "../validations/company.validation.js";

const router = express.Router();

router.route('/register').post(companyRegister);
router.route('/login').post(validate(companyLoginSchema), companyLogin);
router.route('/send-verification').post(sendVerificationEmail);
router.route('/verify-email').post(verifyEmail);

// Razorpay Subscriptions
router.route('/subscription/create-order').post(verifyJWT, authorizeRoles("company"), validate(createOrderSchema), createRazorpayOrder);
router.route('/subscription/verify-payment').post(verifyJWT, authorizeRoles("company"), validate(verifyPaymentSchema), verifyRazorpayPayment);
router.route('/subscription/current').get(verifyJWT, authorizeRoles("company"), getCurrentSubscription);

// HR Management Routes (Company Access)
router.route('/hr')
    .post(
        verifyJWT, 
        authorizeRoles("company"), 
        checkActiveSubscription, 
        validate(createHRSchema), 
        createHR
    )
    .get(
        verifyJWT, 
        authorizeRoles("company"), 
        getCompanyHRs
    );

router.route('/hr/:id')
    .get(
        verifyJWT, 
        authorizeRoles("company"), 
        getCompanyHRById
    )
    .put(
        verifyJWT, 
        authorizeRoles("company"), 
        validate(updateHRSchema), 
        updateCompanyHR
    )
    .delete(
        verifyJWT, 
        authorizeRoles("company"), 
        deleteHR
    );

router.route('/hr/:id/activate')
    .patch(
        verifyJWT, 
        authorizeRoles("company"), 
        activateHR
    );

router.route('/hr/:id/deactivate')
    .patch(
        verifyJWT, 
        authorizeRoles("company"), 
        deactivateHR
    );

router.route('/hr/:id/reset-password')
    .post(
        verifyJWT, 
        authorizeRoles("company"), 
        validate(resetHRPasswordSchema), 
        resetHRPassword
    );

// Profile Helper Middleware to parse nested JSON
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

// Company Profile Routes
router.route('/profile')
    .get(verifyJWT, authorizeRoles("company"), getCompanyProfile)
    .put(
        verifyJWT,
        authorizeRoles("company"),
        uploadImage.single("logo"),
        parseBodyJson(["socialLinks"]),
        validate(updateCompanyProfileSchema),
        updateCompanyProfile
    );

router.route('/profile/:id')
    .get(getCompanyProfileById);

router.route('/jobs')
    .get(verifyJWT, authorizeRoles("company"), getCompanyJobs);

export default router;