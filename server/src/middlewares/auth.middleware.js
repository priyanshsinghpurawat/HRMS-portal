import jwt from "jsonwebtoken";
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
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

