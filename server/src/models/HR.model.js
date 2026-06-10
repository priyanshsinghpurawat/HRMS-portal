import mongoose, { Schema } from "mongoose";

const hrSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            unique: true,
            index: true
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true
        },
        category: {
            type: String,
            enum: [
                "technical",
                "non-technical",
                "senior-recruiter",
                "manager"
            ],
            required: [true, "Category is required"]
        },
        personalEmail: {
            type: String,
            required: [true, "Personal email is required"],
            trim: true,
            lowercase: true
        },
        designation: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const HR = mongoose.model("HR", hrSchema);
