import mongoose, { Schema } from "mongoose";
import { EXPERIENCE_LEVELS } from "../constants/index.js";

const experienceSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        company: {
            type: String,
            trim: true,
            required: [
                true,
                "Company name is required"
            ],
            maxlength: 100
        },

        title: {
            type: String,
            trim: true,
            required: [
                true,
                "Job title is required"
            ],
            maxlength: 100
        },

        experienceLevel: {
            type: String,
            enum: EXPERIENCE_LEVELS,
            required: [
                true,
                "Experience level is required"
            ]
        },

        startDate: {
            type: Date,
            required: [
                true,
                "Start date is required"
            ]
        },

        endDate: {
            type: Date,
            default: null
        },

        currentlyWorking: {
            type: Boolean,
            default: false
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

/**
 * Prevent invalid dates
 */
experienceSchema.pre("save", function () {

    if (
        this.endDate &&
        this.startDate > this.endDate
    ) {
        throw new Error(
            "End date cannot be before start date"
        );
    }

    /**
     * Remove endDate if currently working
     */
    if (this.currentlyWorking) {
        this.endDate = null;
    }
});

/**
 * Prevent duplicate experiences
 */
experienceSchema.index(
    {
        user: 1,
        company: 1,
        title: 1,
        startDate: 1
    },
    {
        unique: true
    }
);

export const Experience = mongoose.model(
    "Experience",
    experienceSchema
);