import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        employeeId: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        personalEmail: {
            type: String,
            required: true
        },
        companyEmail: {
            type: String,
            unique: true,
            index: true
        },
        department: {
            type: String,
            default: "Engineering"
        },
        designation: {
            type: String,
            default: "Software Engineer"
        },
        joiningDate: {
            type: Date,
            default: Date.now
        },
        reportingManager: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        },
        employmentStatus: {
            type: String,
            enum: ["active", "inactive", "terminated"],
            default: "active",
            index: true
        },
        phone: {
            type: String,
            default: ""
        },
        address: {
            type: String,
            default: ""
        },
        emergencyContact: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

export const Employee = mongoose.model("Employee", employeeSchema);
