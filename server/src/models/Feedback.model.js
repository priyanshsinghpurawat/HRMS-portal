import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot be more than 5"],
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        }
    },
    {
        timestamps: true,
    }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
