import { HR } from "../models/HR.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getHRProfile = asyncHandler(async (req, res) => {
    const hr = await HR.findOne({ user: req.user._id })
        .populate("user", "name email phone role mustChangePassword")
        .populate("company", "name logo website");

    if (!hr) {
        throw new ApiError(404, "HR profile not found");
    }

    return res.status(200).json(new ApiResponse(200, hr, "HR profile fetched successfully"));
});

export const updateHRProfile = asyncHandler(async (req, res) => {
    const hr = await HR.findOne({ user: req.user._id });

    if (!hr) {
        throw new ApiError(404, "HR profile not found");
    }

    // Update allowed fields
    const allowedUpdates = ["designation", "phone", "personalEmail"];
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            hr[key] = req.body[key];
        }
    }

    await hr.save();
    return res.status(200).json(new ApiResponse(200, hr, "HR profile updated successfully"));
});
