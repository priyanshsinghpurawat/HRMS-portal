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
            sparse: true,
            match: [/^https?:\/\/.+/, "Invalid website URL"]
        },
        
        socialLinks: {
            linkedin: {
                type: String,
                trim: true,
                default: "",
                match: [/^https?:\/\/.+/, "Invalid LinkedIn URL"]
            },
        },

        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner ID is required"]
        },

        hrIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
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

        isEmailVerified: {
            type: Boolean,
            default: false
        },

        isBusinessVerified: {
            type: Boolean,
            default: false
        },

        verificationOTP: {
            type: String,
            default: ""
        },

        verificationOTPExpires: {
            type: Date,
            default: null
        },

        isActive: {
            type: Boolean,
            default:true
        },

        isProfileCompleted: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

export const Company = mongoose.model("Company", companySchema);