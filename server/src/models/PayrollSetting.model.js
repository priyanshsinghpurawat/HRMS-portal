import mongoose, { Schema } from "mongoose";

const payrollSettingSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            unique: true,
            index: true
        },
        weeklyOffDays: {
            type: [String],
            enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            default: ["Sunday"]
        },

        payrollCycle: {
            type: String,
            enum: ["Monthly"],
            default: "Monthly"
        },
        salaryReleaseDay: {
            type: Number,
            required: [true, "Salary release day is required"],
            min: [1, "Salary release day cannot be less than 1"],
            max: [31, "Salary release day cannot be greater than 31"],
            default: 1
        },
        salaryType: {
            type: String,
            enum: ["Monthly"],
            default: "Monthly"
        },
        defaultCurrency: {
            type: String,
            default: "INR",
            trim: true
        },
        timezone: {
            type: String,
            default: "Asia/Kolkata",
            trim: true
        },
        financialYearStart: {
            type: String,
            enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            default: "April"
        },
        isPayrollEnabled: {
            type: Boolean,
            default: false
        },
        taxConfig: {
            pf: {
                enabled: { type: Boolean, default: false },
                employeeContribution: { type: Number, default: 0, min: 0, max: 100 },
                employerContribution: { type: Number, default: 0, min: 0, max: 100 }
            },
            esic: {
                enabled: { type: Boolean, default: false },
                employeeContribution: { type: Number, default: 0, min: 0, max: 100 },
                employerContribution: { type: Number, default: 0, min: 0, max: 100 }
            },
            pt: {
                enabled: { type: Boolean, default: false }
            },
            tds: {
                enabled: { type: Boolean, default: false }
            }
        }
    },
    {
        timestamps: true
    }
);

export const PayrollSetting = mongoose.model("PayrollSetting", payrollSettingSchema);
