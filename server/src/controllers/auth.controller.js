import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Profile } from "../models/Profile.model.js";
import { HR } from "../models/HR.model.js";
import { verifyGoogleToken } from "../services/googleAuth.service.js";
import { sendEmail } from "../services/email.service.js";

export const generateAccessAndRefreshTokens = async (userId, session = null) => {
    try {
        const user = await User.findById(userId).session(session);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false, session });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    const existedUser = await User.findOne({
        $or: [{ email }, { phone }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or phone already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        role: role || "user"
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Initialize an empty profile for the new user
    await Profile.create({ user: createdUser._id });

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Check if HR account is active
    if (user.role === "hr") {
        const hrProfile = await HR.findOne({ user: user._id });
        if (hrProfile && !hrProfile.isActive) {
            throw new ApiError(403, "Your HR account is inactive. Please contact your company administrator.");
        }
    }

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

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
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const getCurrentUser =
    asyncHandler(
        async (
            req,
            res
        ) => {
            const user =
                await User.findById(
                    req.user._id
                ).select(
                    "-password -refreshToken"
                );

            if (
                !user
            ) {
                throw new ApiError(
                    404,
                    "User not found"
                );
            }

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        user,
                        "Current user fetched"
                    )
                );
        }
    );

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/"
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Fetch user with password selected
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify current password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old password is incorrect");
    }

    // Update password
    user.password = newPassword;
    // Set mustChangePassword to false
    user.mustChangePassword = false;

    await user.save();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json(new ApiResponse(200, {}, "If an account exists, a reset link has been sent"));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    await sendEmail({
        to: user.email,
        subject: "Password Reset Request - JobDekho",
        body: `You requested a password reset. Click the link to reset: ${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#F9F9F9;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center"><table max-width="600" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.03);"><tr><td align="center" style="padding:40px;"><h1 style="font-size:22px;color:#1A1A1A;margin:0 0 16px;">Reset Your Password</h1><p style="font-size:15px;color:#555;line-height:24px;margin:0 0 24px;">Click the button below to reset your password. This link expires in <strong style="color:#FF5500;">15 minutes</strong>.</p><a href="${resetUrl}" style="display:inline-block;background:#FF5500;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">Reset Password</a><p style="font-size:13px;color:#999;margin:24px 0 0;">If you didn't request this, ignore this email.</p></td></tr></table></td></tr></table></body></html>`
    });

    return res.status(200).json(new ApiResponse(200, {}, "If an account exists, a reset link has been sent"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new ApiError(400, "Token and new password are required");

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, "Invalid or expired reset token");

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

const googleLoginUser = asyncHandler(async (req, res) => {
    const { token } = req.body;

    const googlePayload = await verifyGoogleToken(token);

    let user = await User.findOne({ email: googlePayload.email });

    if (!user) {
        // Create new user (Sign Up)
        user = await User.create({
            name: googlePayload.name,
            email: googlePayload.email,
            googleId: googlePayload.googleId,
            authProvider: "google",
            avatar: googlePayload.picture,
            isEmailVerified: true,
            role: "user",
            accountStatus: "active"
        });

        // Initialize candidate profile
        await Profile.create({ user: user._id });
    } else {
        // Link Google ID or update avatar (Sign In / Merge)
        let isModified = false;
        if (!user.googleId) {
            user.googleId = googlePayload.googleId;
            isModified = true;
        }
        if (user.avatar !== googlePayload.picture) {
            user.avatar = googlePayload.picture;
            isModified = true;
        }
        if (!user.isEmailVerified) {
            user.isEmailVerified = true;
            isModified = true;
        }

        if (isModified) {
            await user.save({ validateBeforeSave: false });
        }
    }

    // Check if HR account is active
    if (user.role === "hr") {
        const hrProfile = await HR.findOne({ user: user._id });
        if (hrProfile && !hrProfile.isActive) {
            throw new ApiError(403, "Your HR account is inactive. Please contact your company administrator.");
        }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

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
                    accessToken,
                    refreshToken
                },
                "Google login successful"
            )
        );
});

export { registerUser, loginUser, getCurrentUser, logoutUser, forgotPassword, resetPassword, googleLoginUser };
