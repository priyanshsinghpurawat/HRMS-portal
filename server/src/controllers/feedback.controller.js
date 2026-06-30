import { Feedback } from "../models/Feedback.model.js";
import { Company } from "../models/Company.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

/**
 * Create feedback for a company.
 * Only accessible by users with role = company.
 */
export const createFeedback = asyncHandler(async (req, res) => {
    const { title, description, rating, companyID, companyId } = req.body;
    const targetCompanyId = companyID || companyId;

    if (!mongoose.Types.ObjectId.isValid(targetCompanyId)) {
        throw new ApiError(400, "Invalid Company ID format");
    }

    // Verify company exists
    const company = await Company.findById(targetCompanyId);
    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    // Verify the logged-in user is the owner/associated with the company
    if (company.ownerId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to post feedback for this company");
    }

    // Create the feedback record
    const feedback = await Feedback.create({
        title,
        description,
        rating,
        companyId: targetCompanyId,
        userId: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, feedback, "Feedback submitted successfully"));
});

/**
 * Get feedbacks of companies.
 * Only accessible by users with role = company.
 */
export const getCompanyFeedbacks = asyncHandler(async (req, res) => {
    const { companyId } = req.query;
    const filter = {};

    if (companyId) {
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            throw new ApiError(400, "Invalid Company ID format");
        }
        filter.companyId = companyId;
    }

    const feedbacks = await Feedback.find(filter)
        .populate({
            path: "companyId",
            select: "name logo"
        });

    // Format response to include company profile photo, name, title, description, and rating
    const formattedFeedbacks = feedbacks.map((fb) => ({
        _id: fb._id,
        title: fb.title,
        description: fb.description,
        rating: fb.rating,
        companyId: fb.companyId?._id || null,
        companyName: fb.companyId?.name || "Unknown Company",
        companyProfilePhoto: fb.companyId?.logo || "",
        createdAt: fb.createdAt,
        updatedAt: fb.updatedAt
    }));

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                formattedFeedbacks,
                "Company feedbacks retrieved successfully"
            )
        );
});
