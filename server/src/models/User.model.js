import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/index.js";

const userSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "Full name is required"],
            minLength: [3, "Full name must be at least 3 characters"],
            maxLength: [64, "Full name cannot exceed 64 characters"]
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: [true, "Email address is required"],
            index: true
        },

        phone: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
            index: true
        },

        password: {
            type: String,
            required: [
                function () {
                    return this.authProvider === "local";
                },
                "Password is required"
            ],
            minLength: [8, "Password must be at least 8 characters"],
            select: false
        },

        role: {
            type: String,
            enum: Object.values(USER_ROLES),
            default: USER_ROLES.USER,
            index: true
        },
        
        accountStatus: {
            type: String,
            enum: ["active", "suspended", "deleted"],
            default: "active"
        },

        lastLogin: {
            type: Date
        },

        refreshToken: {
            type: String
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
        },

        personalEmail: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true
        },

        category: {
            type: String,
            enum: [
                "tech",
                "non-tech",
                "sales",
                "marketing",
                "finance",
                "operations",
                "recruitment"
            ]
        },

        mustChangePassword: {
            type: Boolean,
            default: false
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
            index: true
        },

        avatar: {
            type: String,
            default: ""
        },

        isEmailVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {

    if (!this.password || !this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);

});

userSchema.methods.isPasswordCorrect = async function (password) {

    return await bcrypt.compare(password, this.password);

};

userSchema.methods.generateAccessToken = function () {

    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn:
                process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    );

};

userSchema.methods.generateRefreshToken = function () {

    return jwt.sign(
        {
            id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:
                process.env.REFRESH_TOKEN_EXPIRY || "7d"
        }
    );

};

export const User = mongoose.model("User", userSchema);