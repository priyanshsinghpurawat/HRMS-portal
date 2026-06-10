import { Company } from "../models/Company.model.js";
import { Subscription } from "../models/Subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Middleware to check if the authenticated company has an active subscription.
 * Automatically marks expired subscriptions as "expired" on access.
 */
export const checkActiveSubscription = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized - User not logged in");
    }

    // Find the company profile belonging to this user
    const company = await Company.findOne({ ownerId: req.user._id });
    if (!company) {
        throw new ApiError(404, "Company profile not found");
    }

    // Find active subscription for the company
    const subscription = await Subscription.findOne({
        companyId: company._id,
        status: "active"
    });

    if (!subscription) {
        throw new ApiError(403, "Active subscription required.");
    }

    // Check if subscription has expired
    if (subscription.expiresAt < new Date()) {
        subscription.status = "expired";
        await subscription.save();
        throw new ApiError(403, "Active subscription required.");
    }

    // Attach company and subscription info to req for downstream usage
    req.company = company;
    req.subscription = subscription;

    next();
});
