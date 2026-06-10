import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, "Job title is required"],
            maxLength: [100, "Job title cannot exceed 100 characters"]
        },
        description: {
            type: String,
            required: [true, "Job description is required"]
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "HR",
            required: [true, "Creator (HR) ID is required"],
            index: true
        },
        department: {
            type: String,
            trim: true,
            required: [true, "Department is required"]
        },
        employmentType: {
            type: String,
            enum: [
                "full-time",
                "part-time",
                "internship",
                "contract",
                "remote"
            ],
            required: [true, "Employment type is required"]
        },
        experienceLevel: {
            type: String,
            enum: [
                "fresher",
                "junior",
                "mid",
                "senior"
            ],
            required: [true, "Experience level is required"]
        },
        salaryMin: {
            type: Number,
            required: [true, "Minimum salary is required"]
        },
        salaryMax: {
            type: Number,
            required: [true, "Maximum salary is required"]
        },
        location: {
            type: String,
            trim: true,
            required: [true, "Location is required"]
        },
        skills: {
            type: [String],
            default: []
        },
        openings: {
            type: Number,
            default: 1
        },
        applicationCount: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["draft", "active", "closed"],
            default: "active",
            index: true
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: {
            type: Date,
            default: null
        },
        notificationProcessed: {
            type: Boolean,
            default: false
        },
        aiModeration: {
            isChecked: {
                type: Boolean,
                default: false
            },
            isSafe: {
                type: Boolean,
                default: true
            },
            riskScore: {
                type: Number,
                default: 0
            },
            reasons: {
                type: [String],
                default: []
            },
            checkedAt: {
                type: Date
            }
        }
    },
    {
        timestamps: true
    }
);

export const Job = mongoose.model("Job", jobSchema);
