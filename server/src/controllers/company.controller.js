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
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { HR } from "../models/HR.model.js";
import { Job } from "../models/Job.model.js";

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
    let createdUserRecord;
    let companyRecord;
    let accessToken;
    let refreshToken;

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
                    isEmailVerified: true,
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
        const tokens = await generateAccessAndRefreshTokens(user._id, session);
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;

        // Commit transaction
        await session.commitTransaction();

        createdUserRecord = user;
        companyRecord = company;
    } catch (error) {
        // Abort transaction and bubble error
        await session.abortTransaction();
        throw error;
    } finally {
        // End the session
        session.endSession();
    }

    // Send OTP verification email (outside transaction)
    try {
        await sendCompanyVerificationOTPEmail({
            to: email,
            name,
            otp
        });
    } catch (emailError) {
        console.error("Failed to send company verification OTP email:", emailError);
    }

    // Fetch created user without password/refreshToken
    const createdUser = await User.findById(createdUserRecord._id).select("-password -refreshToken");

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
                    company: companyRecord,
                    accessToken,
                    refreshToken
                },
                "Company registered successfully"
            )
        );
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
    let subscription;
    let expiresAt;
    try {
        // Update payment
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paymentStatus = "success";
        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save({ session });

        const startDate = new Date();
        expiresAt = new Date(startDate.getTime() + planConfig.duration * 24 * 60 * 60 * 1000);

        // Expire any existing active subscriptions first
        await Subscription.updateMany(
            { companyId: company._id, status: "active" },
            { $set: { status: "expired" } },
            { session }
        );

        // Create subscription
        const [createdSubscription] = await Subscription.create([
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

        subscription = createdSubscription;
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    // Send Purchase Confirmation Email (outside of transaction)
    try {
        await sendSubscriptionConfirmationEmail({
            to: req.user.email,
            name: req.user.name,
            companyName: company.name,
            planName: plan,
            amount: planConfig.amount,
            paymentId: razorpay_payment_id,
            expiresAt
        });
    } catch (emailError) {
        console.error("Failed to send subscription confirmation email:", emailError);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            subscription,
            "Payment verified and subscription activated successfully"
        )
    );
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
    const { name, personalEmail, category, designation, phone } = req.body;

    // Retrieve company from request (attached by checkActiveSubscription middleware)
    const company = req.company;

    // Verify unique personalEmail across accounts
    const existedPersonalEmail = await User.findOne({ personalEmail });
    if (existedPersonalEmail) {
        throw new ApiError(400, "Personal email already registered by another HR");
    }

    // 5. Auto-Generate unique login email: hr.<hr-name>@<company-name>.company
    const sanitizedHRName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const sanitizedCompanyName = company.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    let email = `hr.${sanitizedHRName}@${sanitizedCompanyName}.company`;
    let counter = 1;
    while (await User.findOne({ email })) {
        email = `hr.${sanitizedHRName}${counter}@${sanitizedCompanyName}.company`;
        counter++;
    }

    // 6. Generate random secure temporary password
    const tempPassword = generateTempPassword();

    // 7. Database Transaction for User and HR creation
    const session = await mongoose.startSession();
    session.startTransaction();

    let hrUser;
    let hrProfile;
    try {
        const [createdHR] = await User.create(
            [
                {
                    name,
                    email,
                    personalEmail,
                    password: tempPassword,
                    role: "hr",
                    mustChangePassword: true
                }
            ],
            { session }
        );

        if (!createdHR) {
            throw new ApiError(500, "Something went wrong while creating the HR user account");
        }

        hrUser = createdHR;

        const [createdHRProfile] = await HR.create(
            [
                {
                    user: hrUser._id,
                    company: company._id,
                    category,
                    personalEmail,
                    designation: designation || "",
                    phone: phone || "",
                    isActive: true
                }
            ],
            { session }
        );

        if (!createdHRProfile) {
            throw new ApiError(500, "Something went wrong while creating the HR profile");
        }

        hrProfile = createdHRProfile;

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

    // 8. Email Delivery
    await sendHRCredentialsEmail({
        personalEmail,
        name,
        companyName: company.name,
        category,
        loginEmail: email,
        tempPassword
    });

    return res.status(201).json(new ApiResponse(201, {
        hr: {
            _id: hrProfile._id,
            user: {
                _id: hrUser._id,
                name: hrUser.name,
                email: hrUser.email
            },
            category: hrProfile.category,
            personalEmail: hrProfile.personalEmail,
            designation: hrProfile.designation,
            phone: hrProfile.phone,
            isActive: hrProfile.isActive
        }
    }, "HR created successfully"));
});

export const getCompanyHRs = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const hrs = await HR.find({ company: company._id }).populate("user", "name email phone mustChangePassword role");
    return res.status(200).json(new ApiResponse(200, hrs, "HR profiles fetched successfully"));
});

export const getCompanyHRById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid HR profile ID format");
    }

    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const hr = await HR.findOne({ _id: id, company: company._id }).populate("user", "name email phone mustChangePassword role");
    if (!hr) {
        throw new ApiError(404, "HR profile not found in this company");
    }

    return res.status(200).json(new ApiResponse(200, hr, "HR profile fetched successfully"));
});

export const updateCompanyHR = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid HR profile ID format");
    }

    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const hr = await HR.findOne({ _id: id, company: company._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found in this company");
    }

    // Update allowed fields
    const allowedUpdates = ["category", "designation", "phone", "personalEmail"];
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            hr[key] = req.body[key];
        }
    }

    await hr.save();
    return res.status(200).json(new ApiResponse(200, hr, "HR profile updated successfully"));
});

export const activateHR = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid HR profile ID format");
    }

    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const hr = await HR.findOneAndUpdate(
        { _id: id, company: company._id },
        { isActive: true },
        { new: true }
    );
    if (!hr) {
        throw new ApiError(404, "HR profile not found in this company");
    }

    return res.status(200).json(new ApiResponse(200, hr, "HR profile activated successfully"));
});

export const deactivateHR = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid HR profile ID format");
    }

    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const hr = await HR.findOneAndUpdate(
        { _id: id, company: company._id },
        { isActive: false },
        { new: true }
    );
    if (!hr) {
        throw new ApiError(404, "HR profile not found in this company");
    }

    return res.status(200).json(new ApiResponse(200, hr, "HR profile deactivated successfully"));
});

export const resetHRPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid HR profile ID format");
    }

    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const hr = await HR.findOne({ _id: id, company: company._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found in this company");
    }

    const user = await User.findById(hr.user);
    if (!user) {
        throw new ApiError(404, "Linked HR user account not found");
    }

    const tempPassword = generateTempPassword();
    user.password = tempPassword;
    user.mustChangePassword = true;
    await user.save();

    await sendHRCredentialsEmail({
        personalEmail: hr.personalEmail,
        name: user.name,
        companyName: company.name,
        category: hr.category,
        loginEmail: user.email,
        tempPassword
    });

    return res.status(200).json(new ApiResponse(200, null, "HR password reset successfully and credentials sent to personal email"));
});

export const deleteHR = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid HR profile ID format");
    }

    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const hr = await HR.findOne({ _id: id, company: company._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found in this company");
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await User.findByIdAndDelete(hr.user).session(session);
        await HR.findByIdAndDelete(hr._id).session(session);

        company.hrIds = company.hrIds.filter(hrId => hrId.toString() !== hr.user.toString());
        await company.save({ session });

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }

    return res.status(200).json(new ApiResponse(200, null, "HR deleted successfully"));
});

export const updateCompanyProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Find the company profile belonging to this user (ownerId is linked to user)
    const company = await Company.findOne({ ownerId: userId });

    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    // Update allowable fields
    const allowedUpdates = ["description", "website", "socialLinks"];
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            company[key] = req.body[key];
        }
    }

    // Handle logo upload if a file was provided
    if (req.file) {
        if (req.file.size > 5 * 1024 * 1024) {
            throw new ApiError(400, "Logo image size cannot exceed 5 MB");
        }

        // Upload new logo to Cloudinary
        const uploadResult = await uploadOnCloudinary(req.file.buffer, "job_portal/company_logos", "image");

        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload company logo to Cloudinary");
        }

        // Delete existing logo from Cloudinary if it was stored as a Cloudinary asset
        if (company.logo && company.logo.includes("cloudinary.com")) {
            try {
                // Extract public_id from Cloudinary URL: e.g. http://res.cloudinary.com/demo/image/upload/v1570975253/job_portal/company_logos/xxx.jpg
                const parts = company.logo.split("/");
                const filenameWithExt = parts[parts.length - 1];
                const publicId = `job_portal/company_logos/${filenameWithExt.split(".")[0]}`;
                await deleteFromCloudinary(publicId, "image");
            } catch (err) {
                console.error("Error extracting and deleting logo from Cloudinary:", err);
            }
        }

        company.logo = uploadResult.secure_url;
    }

    // Set profile completion flag if description and website are populated
    if (company.description && company.website) {
        company.isProfileCompleted = true;
    }

    await company.save();

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company profile updated successfully"));
});

export const getCompanyProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const company = await Company.findOne({ ownerId: userId }).populate("ownerId", "name email phone role");

    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company profile fetched successfully"));
});

export const getCompanyProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Company ID format");
    }

    const company = await Company.findById(id).populate("ownerId", "name email phone role");

    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, company, "Company profile fetched successfully"));
});

export const getCompanyJobs = asyncHandler(async (req, res) => {
    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    const jobs = await Job.find({ company: company._id, isDeleted: false })
        .populate({
            path: "createdBy",
            populate: {
                path: "user",
                select: "name email phone"
            }
        });

    return res.status(200).json(new ApiResponse(200, jobs, "Company job listings fetched successfully"));
});