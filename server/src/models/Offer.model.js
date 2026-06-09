import mongoose, { Schema } from "mongoose";

const offerSchema = new Schema(
    {
        application: {
            type: Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            index: true
        },
        candidate: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        designation: {
            type: String,
            required: true
        },
        department: {
            type: String,
            required: true
        },
        annualCTC: {
            type: Number,
            required: true
        },
        joiningDate: {
            type: Date,
            required: true
        },
        offerLetterUrl: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["sent", "accepted", "rejected", "expired"],
            default: "sent",
            index: true
        }
    },
    {
        timestamps: true
    }
);

export const Offer = mongoose.model("Offer", offerSchema);
