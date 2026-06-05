import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "Company name is required"],
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        logo: {
            type: String,
            trim: true,
            default: ""
        },

        website: {
            type: String,
            trim: true,
            unique: true,
            match: [/^https?:\/\/.+/, "Invalid website URL"],
            default: ""
        },

        location: {
            country: {
                type: String,
                trim: true,
                default: ""
            },

            state: {
                type: String,
                trim: true,
                default: ""
            },

            city: {
                type: String,
                trim: true,
                default: ""
            },

            address: {
                type: String,
                trim: true,
                maxlength: 200,
                default: ""
            },

            pincode: {
                type: String,
                trim: true,
                default: ""
            }
        },

        socialLinks: {
            linkedin: {
                type: String,
                trim: true,
                default: "",
                match: [/^https?:\/\/.+/, "Invalid LinkedIn URL"]
            },
        },

        hrIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "HR"
            }
        ],

        tanId: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "TAN ID is required"],
            match: [
                /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/,
                "Invalid TAN ID"
            ]
        },

        gstId: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "GST ID is required"],
            match: [
                /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[A-Z]{1}\d{1}$/,
                "Invalid GST ID"
            ]
        },

        isVerified: {
            type: String,
            enum: ["pending", "fullfield", "reject"],
            default: "pending"
        },

        isActive: {
            type: Boolean,
            default: false
        },

        isProfileCompleted: {
            type: Boolean,
            default: false
        },
        blocked: {
            isBlocked: {
                type: Boolean,
                default: false
            },
            blockedReason: {
                type: String,
                default: ""
            },
            blockedAt: {
                type: Date,
                default: null
            }
        }
    },
    {
        timestamps: true
    }
);

export const Company = mongoose.model("Company", companySchema);