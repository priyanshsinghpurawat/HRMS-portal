import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Profile } from "../models/Profile.model.js";
import { Location } from "../models/Location.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
        profile = await Profile.create({ user: userId });
    }

    // Merge req.body properties
    const allowedUpdates = ["title", "about", "gender", "languages", "experienceLevel", "socialLinks"];
    
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            profile[key] = req.body[key];
        }
    }

    // Handle separate location schema update
    if (req.body.location !== undefined) {
        await Location.findOneAndUpdate(
            { ownerId: userId, ownerType: "User" },
            { 
                ownerId: userId,
                ownerType: "User",
                ...req.body.location 
            },
            { upsert: true, new: true }
        );
    }

    const profileImageFile = req.files?.profileImage?.[0];
    const resumeFile = req.files?.resume?.[0];

    // Handle profile image upload if present
    if (profileImageFile) {
        if (profileImageFile.size > 5 * 1024 * 1024) {
            throw new ApiError(400, "Profile image size cannot exceed 5 MB");
        }

        // Delete existing image from Cloudinary if it exists
        if (profile.profileImage?.public_id) {
            await deleteFromCloudinary(profile.profileImage.public_id, "image");
        }

        // Upload new image via stream
        const uploadResult = await uploadOnCloudinary(profileImageFile.buffer, "job_portal/profiles", "image");

        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload image to Cloudinary");
        }

        profile.profileImage = {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        };
    }

    // Handle resume upload if present
    if (resumeFile) {
        // Delete existing resume from Cloudinary if it exists
        if (profile.resume?.public_id) {
            await deleteFromCloudinary(profile.resume.public_id, "raw");
        }

        // Upload new resume via stream
        const uploadResult = await uploadOnCloudinary(resumeFile.buffer, "job_portal/resumes", "auto");

        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload resume to Cloudinary");
        }

        profile.resume = {
            url: uploadResult.secure_url.replace("/upload/", "/upload/f_auto/"),
            public_id: uploadResult.public_id
        };
    }

    await profile.save();

    const location = await Location.findOne({ ownerId: userId, ownerType: "User" });

    return res
        .status(200)
        .json(new ApiResponse(200, { ...profile.toObject(), location }, "Profile updated successfully"));
});

const getProfile = asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ user: req.user._id }).populate("user", "name email phone role isVerified");

    if (!profile) {
        throw new ApiError(404, "Profile not found");
    }

    const location = await Location.findOne({ ownerId: req.user._id, ownerType: "User" });

    return res
        .status(200)
        .json(new ApiResponse(200, { ...profile.toObject(), location }, "Profile fetched successfully"));
});

export { updateProfile, getProfile };
