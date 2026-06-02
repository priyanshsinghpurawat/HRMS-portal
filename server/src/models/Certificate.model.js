import mongoose, { Schema } from "mongoose";

const certificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        certificationName: {
            type: String,
            trim: true,
            required: [true, "Certification name is required"],
            maxlength: [
                100,
                "Certification name cannot exceed 100 characters"
            ]
        },

        issuingOrganization: {
            type: String,
            trim: true,
            required: [
                true,
                "Issuing organization is required"
            ],
            maxlength: [
                100,
                "Organization name cannot exceed 100 characters"
            ]
        },

        issueDate: {
            type: Date,
            required: [true, "Issue date is required"]
        },

        expirationDate: {
            type: Date,
            default: null
        },

        doesNotExpire: {
            type: Boolean,
            default: false
        },

        credentialId: {
            type: String,
            trim: true,
            default: "",
            maxlength: [
                100,
                "Credential ID cannot exceed 100 characters"
            ]
        },

        credentialUrl: {
            type: String,
            trim: true,
            default: "",
            match: [
                /^https?:\/\/.+/,
                "Invalid credential URL"
            ]
        },

        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: [
                500,
                "Description cannot exceed 500 characters"
            ]
        },

        certificate: {
            url: {
                type: String,
                trim: true,
                default: ""
            },

            public_id: {
                type: String,
                trim: true,
                default: ""
            }
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

certificationSchema.pre("save", function () {

    if (
        this.expirationDate &&
        this.issueDate > this.expirationDate
    ) {
        throw new Error(
            "Expiration date cannot be before issue date"
        );
    }

    if (this.doesNotExpire) {
        this.expirationDate = null;
    }
});

certificationSchema.index(
    {
        user: 1,
        certificationName: 1,
        issuingOrganization: 1,
        credentialId: 1
    },
    {
        unique: true
    }
);

export const Certification = mongoose.model(
    "Certification",
    certificationSchema
);