import mongoose, { Schema } from "mongoose";
import { EDUCATION_LEVELS } from "../constants/index.js";

const educationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        institution: {
            type: String,
            trim: true,
            required: [true, "Institution name is required"],
            maxLength: [100, "Institution name cannot exceed 100 characters"]
        },
        degree: {
            type: String,
            trim: true,
            required: [true, "Degree is required"],
            maxLength: [100, "Degree cannot exceed 100 characters"]
        },
        fieldOfStudy: {
            type: String,
            trim: true,
            required: [true, "Field of study is required"],
            maxLength: [100, "Field of study cannot exceed 100 characters"]
        },
        educationLevel: {
            type: String,
            enum: EDUCATION_LEVELS,
            required: [true, "Education level is required"]
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"]
        },
        endDate: {
            type: Date
        },
        currentlyStudying: {
            type: Boolean,
            default: false
        },
        grade: {
            type: String,
            trim: true,
            maxLength: [20, "Grade cannot exceed 20 characters"]
        },
    },
    {
        timestamps: true
    }
);

// Ensure a user cannot have duplicate education entries for the exact same degree and institution
educationSchema.index({ user: 1, institution: 1, degree: 1 }, { unique: true });

export const Education = mongoose.model("Education", educationSchema);
