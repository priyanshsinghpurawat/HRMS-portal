import { Experience } from "../models/Experience.model.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
    experienceValidationSchema , updateExperienceValidationSchema
} from "../validations/experience.validation.js";

export const getExperiences = asyncHandler(async (req, res) => {

    const experiences =
        await Experience.find({
            user: req.user._id,
            isDeleted: false
        })
        .sort({ startDate: -1 });

    if (!experiences.length) {
        throw new ApiError(
            404,
            "No experiences found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            experiences,
            "Experiences fetched successfully"
        )
    );
});

export const createExperience = asyncHandler(async (req, res) => {

    const user = await User.findById(
        req.user._id
    );

    if (!user) {
        throw new ApiError(
            404,
            "User not found"
        );
    }

    /**
     * Validate Request Body
     */
    const validationResult =
        experienceValidationSchema.safeParse(
            req.body
        );

    if (!validationResult.success) {

        const formattedErrors =
            validationResult.error.issues.map(
                (err) => ({
                    field: err.path.join("."),
                    message: err.message
                })
            );

        throw new ApiError(
            400,
            "Validation Error",
            formattedErrors
        );
    }

    const {
        company,
        title,
        experienceLevel,
        startDate,
        endDate,
        currentlyWorking,
        description
    } = validationResult.data;

    /**
     * Prevent Duplicate Experience
     */
    const existingExperience =
        await Experience.findOne({
            user: user._id,
            company,
            title,
            startDate
        });

    if (existingExperience) {
        throw new ApiError(
            409,
            "Experience already exists"
        );
    }

    /**
     * Create Experience
     */
    const experience =
        await Experience.create({
            user: user._id,
            company,
            title,
            experienceLevel,
            startDate,
            endDate,
            currentlyWorking,
            description
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            experience,
            "Experience added successfully"
        )
    );
});

export const updateExperience = asyncHandler(async (req, res) => {

    const { experienceId } = req.params;

    const experience =
        await Experience.findById(
            experienceId
        );

    if (!experience) {
        throw new ApiError(
            404,
            "Experience not found"
        );
    }

    /**
     * Ownership Check
     */
    if (
        experience.user.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to update this experience"
        );
    }

    /**
     * Validate Request Body
     */
    const validationResult =
        updateExperienceValidationSchema
            .safeParse(req.body);

    if (!validationResult.success) {

        const formattedErrors =
            validationResult.error.issues.map(
                (err) => ({
                    field: err.path.join("."),
                    message: err.message
                })
            );

        throw new ApiError(
            400,
            "Validation Error",
            formattedErrors
        );
    }

    const allowedFields = [
        "company",
        "title",
        "experienceLevel",
        "startDate",
        "endDate",
        "currentlyWorking",
        "description"
    ];

    /**
     * Update Allowed Fields Only
     */
    allowedFields.forEach((field) => {

        if (
            validationResult.data[field] !==
            undefined
        ) {
            experience[field] =
                validationResult.data[field];
        }

    });

    /**
     * Remove endDate
     * if currently working
     */
    if (experience.currentlyWorking) {
        experience.endDate = null;
    }

    await experience.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            experience,
            "Experience updated successfully"
        )
    );
});

export const deleteExperience = asyncHandler(async (req, res) => {

    const { experienceId } = req.params;

    const experience =
        await Experience.findById(
            experienceId
        );

    if (!experience) {
        throw new ApiError(
            404,
            "Experience not found"
        );
    }

    /**
     * Ownership Check
     */
    if (
        experience.user.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to delete this experience"
        );
    }

    await experience.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Experience deleted successfully"
        )
    );
});