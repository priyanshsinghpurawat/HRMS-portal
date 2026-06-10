import { Company } from "../models/Company.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { companySchemaValidation } from "../validations/company.validation.js";
import { generateAccessAndRefreshTokens } from "./auth.controller.js";
import { Subscription } from "../models/Subscription.model.js";
import { Payment } from "../models/Payment.model.js";
import { sendHRCredentialsEmail, sendCompanyVerificationOTPEmail, sendSubscriptionConfirmationEmail } from "../services/email.service.js";
import { generateTempPassword } from "../utils/RandomPassword.js";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";

export const companyRegister = asyncHandler(async (req, res) => {
    // 1. Zod Validation
    const validationResult = companySchemaValidation.safeParse(req.body);

    if (!validationResult.success) {
        const formattedErrors = validationResult.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));
        throw new ApiError(400, "Validation Error", formattedErrors);
    }

    const {
        email,
        password,
        role,
        name,
        tanId,
        gstId
    } = validationResult.data;

    // 2. Check if user already exists (by email)
    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(400, "User with this email already exists");
    }

    // 3. Check if company already exists (by name, gstId, or tanId)
    const existedCompany = await Company.findOne({
        $or: [
            { name },
            { gstId },
            { tanId }
        ]
    });

    if (existedCompany) {
        throw new ApiError(400, "Company name, GST ID, or TAN ID already registered");
    }

    // Start MongoDB Session and Transaction for Atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // 4. Create User (representing the company account/owner)
        const [user] = await User.create(
            [
                {
                    name,
                    email,
                    password,
                    role: role || "company"
                }
            ],
            { session }
        );

        if (!user) {
            throw new ApiError(500, "Something went wrong while registering the user for the company");
        }

        // 5. Create Company profile (with verification forced to false and ownerId linked)
        const [company] = await Company.create(
            [
                {
                    name,
                    tanId,
                    gstId,
                    isEmailVerified: false,
                    isBusinessVerified: false,
                    ownerId: user._id,
                    verificationOTP: otp,
                    verificationOTPExpires: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
                }
            ],
            { session }
        );

        if (!company) {
            throw new ApiError(500, "Something went wrong while creating the company profile");
        }

        // Generate Access and Refresh Tokens within the transaction session
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, session);

        // Commit transaction
        await session.commitTransaction();

        // Fetch created user without password/refreshToken
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        // Send OTP verification email
        await sendCompanyVerificationOTPEmail({
            to: email,
            name,
            otp
        });

        // Set secure HTTP-only cookies
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        };

        return res
            .status(201)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    201,
                    {
                        user: createdUser,
                        company,
                        accessToken,
                        refreshToken
                    },
                    "Company registered successfully"
                )
            );

    } catch (error) {
        // Abort transaction and bubble error
        await session.abortTransaction();
        throw error;
    } finally {
        // End the session
        session.endSession();
    }
});

export const companyLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 2. Find User by Email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // 3. Verify Password
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password");
    }

    // 4. Find Company using ownerId
    const company = await Company.findOne({ ownerId: user._id });

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    // Check if email is verified
    if (!company.isEmailVerified) {
        throw new ApiError(400, "Please verify your email address before logging in.");
    }

    // 5. Fetch active subscription if one exists
    const subscription = await Subscription.findOne({ companyId: company._id, status: "active" });
    const subscriptionData = subscription
        ? { status: subscription.status, plan: subscription.plan }
        : null;

    // 6. Generate fresh Access Token and Refresh Token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // 7. Fetch user details without password and refreshToken (security requirements)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // 8. Set secure HTTP-only Cookies
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    company: {
                        _id: company._id,
                        name: company.name,
                        isEmailVerified: company.isEmailVerified,
                        isBusinessVerified: company.isBusinessVerified,
                        gstId: company.gstId,
                        tanId: company.tanId
                    },
                    subscription: subscriptionData,
                    accessToken,
                    refreshToken
                },
                "Login successful"
            )
        );
});

export const sendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const company = await Company.findOne({ ownerId: user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    if (company.isEmailVerified) {
        throw new ApiError(400, "Email is already verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    company.verificationOTP = otp;
    company.verificationOTPExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await company.save();

    await sendCompanyVerificationOTPEmail({
        to: email,
        name: user.name,
        otp
    });

    return res.status(200).json(new ApiResponse(200, {}, "Verification email sent successfully"));
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const company = await Company.findOne({ ownerId: user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    if (company.isEmailVerified) {
        return res.status(200).json(new ApiResponse(200, {}, "Email is already verified"));
    }

    if (company.verificationOTP !== otp || !company.verificationOTPExpires || company.verificationOTPExpires < new Date()) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    company.isEmailVerified = true;
    company.verificationOTP = "";
    company.verificationOTPExpires = null;
    await company.save();

    return res.status(200).json(new ApiResponse(200, {}, "Email verified successfully. You can now log in."));
});

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PLANS = {
    "1-month": { duration: 30, amount: 999 },
    "3-month": { duration: 90, amount: 2499 },
    "6-month": { duration: 180, amount: 4499 },
    "1-year": { duration: 365, amount: 7999 }
};

export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { plan } = req.body;

    const planConfig = PLANS[plan];
    if (!planConfig) {
        throw new ApiError(400, "Invalid plan selected");
    }

    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    if (!company.isEmailVerified) {
        throw new ApiError(400, "Please verify your email address first.");
    }

    // Check if there is already an active (unexpired) subscription
    const existingActiveSubscription = await Subscription.findOne({
        companyId: company._id,
        status: "active",
        expiresAt: { $gt: new Date() }
    });

    if (existingActiveSubscription) {
        throw new ApiError(400, "You already have an active subscription.");
    }

    // Amount in paise
    const amountInPaise = planConfig.amount * 100;

    const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };

    const order = await razorpay.orders.create(options);

    // Save pending Payment Record
    const payment = await Payment.create({
        companyId: company._id,
        amount: planConfig.amount,
        currency: "INR",
        paymentFor: "subscription-renewal",
        plan,
        razorpayOrderId: order.id,
        paymentGateway: "razorpay",
        paymentStatus: "created",
        status: "created"
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                plan
            },
            "Razorpay order created successfully"
        )
    );
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const planConfig = PLANS[plan];
    if (!planConfig) {
        throw new ApiError(400, "Invalid plan selected");
    }

    // Verify signature
    const bodyText = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(bodyText.toString())
        .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed."
        });
    }

    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    // Find the pending payment
    const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
        companyId: company._id,
        paymentStatus: "created"
    });

    if (!payment) {
        throw new ApiError(404, "Pending payment record not found");
    }

    // Database transaction to update payment and create subscription
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Update payment
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paymentStatus = "success";
        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save({ session });

        const startDate = new Date();
        const expiresAt = new Date(startDate.getTime() + planConfig.duration * 24 * 60 * 60 * 1000);

        // Expire any existing active subscriptions first
        await Subscription.updateMany(
            { companyId: company._id, status: "active" },
            { $set: { status: "expired" } },
            { session }
        );

        // Create subscription
        const [subscription] = await Subscription.create([
            {
                companyId: company._id,
                paymentId: payment._id,
                purchasedBy: req.user._id,
                plan,
                amount: planConfig.amount,
                startDate,
                startsAt: startDate,
                expiresAt,
                status: "active",
                features: [
                    "Create HR",
                    "Manage HR",
                    "Employees",
                    "Attendance",
                    "Payroll",
                    "Recruitment",
                    "Analytics",
                    "Reports"
                ]
            }
        ], { session });

        await session.commitTransaction();

        // Send Purchase Confirmation Email
        await sendSubscriptionConfirmationEmail({
            to: req.user.email,
            name: req.user.name,
            companyName: company.name,
            planName: plan,
            amount: planConfig.amount,
            paymentId: razorpay_payment_id,
            expiresAt
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                subscription,
                "Payment verified and subscription activated successfully"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

export const getCurrentSubscription = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const subscription = await Subscription.findOne({
        companyId: company._id,
        status: "active"
    });

    if (!subscription) {
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "No active subscription found"
            )
        );
    }

    // Check expiry
    if (subscription.expiresAt < new Date()) {
        subscription.status = "expired";
        await subscription.save();
        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "No active subscription found"
            )
        );
    }

    const remainingDays = Math.max(
        0,
        Math.ceil((new Date(subscription.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                plan: subscription.plan,
                status: subscription.status,
                startsAt: subscription.startsAt || subscription.startDate,
                expiresAt: subscription.expiresAt,
                remainingDays
            },
            "Current subscription details fetched successfully"
        )
    );
});


export const createHR = asyncHandler(async (req, res) => {
    const { name, personalEmail, category } = req.body;

    // Retrieve company from request (attached by checkActiveSubscription middleware)
    const company = req.company;

    // Verify unique personalEmail across accounts
    const existedPersonalEmail = await User.findOne({ personalEmail });
    if (existedPersonalEmail) {
        throw new ApiError(400, "Personal email already registered by another HR");
    }

    // 5. Auto-Generate unique login email: hr.<hr-name>@<company-name>.company
    // Sanitization Rules: lowercase, remove spaces, remove special characters
    const sanitizedHRName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const sanitizedCompanyName = company.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    let email = `hr.${sanitizedHRName}@${sanitizedCompanyName}.company`;
    let counter = 1;
    while (await User.findOne({ email })) {
        email = `hr.${sanitizedHRName}${counter}@${sanitizedCompanyName}.company`;
        counter++;
    }

    // 6. Generate random secure temporary password: 8-digit number
    const tempPassword = generateTempPassword();

    // 7. Database Transaction for User creation and Company update
    const session = await mongoose.startSession();
    session.startTransaction();

    let hrUser;
    try {
        const [createdHR] = await User.create(
            [
                {
                    name,
                    email,
                    personalEmail,
                    password: tempPassword,
                    role: "hr",
                    category,
                    mustChangePassword: true
                }
            ],
            { session }
        );

        if (!createdHR) {
            throw new ApiError(500, "Something went wrong while creating the HR user account");
        }

        hrUser = createdHR;

        // Push HR User ID into company's hrIds
        company.hrIds.push(hrUser._id);
        await company.save({ session });

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    // 8. Email Delivery: Send credentials to HR's personalEmail (not generated login email)
    await sendHRCredentialsEmail({
        personalEmail,
        name,
        companyName: company.name,
        category,
        loginEmail: email,
        tempPassword
    });

    // 9. Return Response (do NOT return tempPassword in payload)
    return res
        .status(201)
        .json({
            success: true,
            message: "HR created successfully and credentials sent to personal email.",
            data: {
                hr: {
                    _id: hrUser._id,
                    name: hrUser.name,
                    category: hrUser.category,
                    email: hrUser.email,
                    personalEmail: hrUser.personalEmail
                }
            }
        });
});