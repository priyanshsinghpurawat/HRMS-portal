import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Education } from "../models/Education.model.js";

export const userEducation = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const {
        institution,
        degree,
        fieldOfStudy,
        educationLevel,
        startDate,
        endDate,
        currentlyStudying,
        grade
    } = req.body;

    if (
        !institution ||
        !degree ||
        !fieldOfStudy ||
        !educationLevel ||
        !startDate
    ) {
        throw new ApiError(
            400,
            "All required fields must be provided"
        );
    }

    const existingEducation = await Education.findOne({
        user: user._id,
        degree,
        startDate
    });

    if (existingEducation) {
        throw new ApiError(
            409,
            "Education record already exists"
        );
    }

    const education = await Education.create({
        user: user._id,
        institution,
        degree,
        fieldOfStudy,
        educationLevel,
        startDate,
        endDate,
        currentlyStudying,
        grade
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            education,
            "Education added successfully"
        )
    );
});

export const updateEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const education = await Education.findById(id);

    if (!education) {
        throw new ApiError(404, "Education Record Not Found");
    };

    if (education.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorize to edit this record");
    };

    const allowedFields = [
        "institution",
        "degree",
        "fieldOfStudy",
        "educationLevel",
        "startDate",
        "endDate",
        "currentlyStudying",
        "grade"
    ];
    allowedFields.forEach((field) => {

        if (req.body[field] !== undefined) {
            education[field] = req.body[field];
        }

    });

    if (education.currentlyStudying) {
        education.endDate = null;
    }
    await education.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            education,
            "Education updated successfully"
        )
    );
});

export const deleteEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const education = await Education.findById(id);
    if (!education) {
        throw new ApiError(404, "education record not found")
    };

    if (education.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "you are not authorize to edit this record")
    }

    await education.deleteOne();
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Education deleted successfully"
        )
    );
})