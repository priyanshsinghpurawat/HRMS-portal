// Reserved for future notification system
import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Recipient user ID is required"],
            index: true
        },
        type: {
            type: String,
            enum: [
                "job_match",
                "application_received",
                "application_shortlisted",
                "interview_scheduled",
                "application_rejected",
                "application_hired",
                "employee_onboarded",
                "info",
                "system"
            ],
            default: "info",
            index: true
        },
        message: {
            type: String,
            required: [true, "Notification message is required"],
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        link: {
            type: String,
            trim: true
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

export const Notification = mongoose.model("Notification", notificationSchema);
