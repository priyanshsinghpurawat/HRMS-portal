import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { HR } from "../models/HR.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await User.findById(decodedToken.id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Check if HR account is active
        if (user.role === "hr") {
            const hrProfile = await HR.findOne({ user: user._id });
            if (hrProfile && !hrProfile.isActive) {
                throw new ApiError(403, "Your HR account has been deactivated");
            }
        }

        // Attach user to request object
        req.user = user;

        // Dynamically resolve and attach companyId based on role
        if (user.role === "company") {
            const company = await mongoose.model("Company").findOne({ ownerId: user._id });
            if (company) {
                req.user.companyId = company._id;
            }
        } else if (user.role === "hr") {
            const hrProfile = await HR.findOne({ user: user._id });
            if (hrProfile) {
                req.user.companyId = hrProfile.companyId;
            }
        } else if (user.role === "employee") {
            const employeeProfile = await mongoose.model("Employee").findOne({ user: user._id });
            if (employeeProfile) {
                req.user.companyId = employeeProfile.company;
            }
        }

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

