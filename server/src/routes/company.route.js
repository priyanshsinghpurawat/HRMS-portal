import express from "express";
import { 
    companyRegister, 
    companyLogin, 
    createHR, 
    sendVerificationEmail, 
    verifyEmail, 
    createRazorpayOrder,
    verifyRazorpayPayment,
    getCurrentSubscription
} from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { checkActiveSubscription } from "../middlewares/subscription.middleware.js";
import { 
    companyLoginSchema, 
    createHRSchema,
    createOrderSchema,
    verifyPaymentSchema
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

router.route('/create-hr').post(verifyJWT, authorizeRoles("company"), checkActiveSubscription, validate(createHRSchema), createHR);

export default router;