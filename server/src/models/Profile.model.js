import mongoose, { Schema } from "mongoose";
import { EXPERIENCE_LEVELS, GENDER_ENUM } from "../constants/index.js";
import { Location } from "./Location.model.js";

const profileSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        title: {
            type: String,
            trim: true,
            maxLength: [80, "Professional headline cannot exceed 80 characters"],
            default: ""
        },
        about: {
            type: String,
            trim: true,
            maxLength: [1000, "About section cannot exceed 1000 characters"],
            default: ""
        },
        gender: {
            type: String,
            enum: GENDER_ENUM
        },
        profileImage: {
            url: { type: String, trim: true, default: "" },
            public_id: { type: String, trim: true, default: "" }
        },
        resume: {
            url: { type: String, trim: true, default: "" },
            public_id: { type: String, trim: true, default: "" }
        },
        languages: {
            type: [String],
            default: [],
            set: (value) => [...new Set(value.map((lang) => lang.trim().toLowerCase()))]
        },
        experienceLevel: {
            type: String,
            enum: EXPERIENCE_LEVELS,
            default: "fresher"
        },
        skills: {
            type: [String],
            default: [],
            set: (value) => [...new Set(value.map((skill) => skill.trim()))]
        },

        socialLinks: {
            linkedin: { type: String, trim: true },
            github: { type: String, trim: true },
            portfolio: { type: String, trim: true }
        },
        isProfileCompleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Middleware to calculate and update isProfileCompleted based on field fullness
profileSchema.pre("save", async function () {
    const requiredFields = ["title", "about", "gender"];
    let completed = true;
    for (const field of requiredFields) {
        if (!this[field]) {
            completed = false;
            break;
        }
    }
    if (completed) {
        const location = await Location.findOne({ ownerId: this.user, ownerType: "User" });
        if (!location || !location.city) {
            completed = false;
        }
    }
    this.isProfileCompleted = completed;
});

export const Profile = mongoose.model("Profile", profileSchema);
