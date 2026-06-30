import mongoose, { Schema } from "mongoose";

const holidaySchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true
        },
        holidayName: {
            type: String,
            required: [true, "Holiday Name is required"],
            trim: true
        },
        holidayDate: {
            type: Date,
            required: [true, "Holiday Date is required"]
        },
        holidayType: {
            type: String,
            enum: ['National', 'Festival', 'Company', 'Regional', 'Custom'],
            required: [true, "Holiday Type is required"]
        },
        holidayCategory: {
            type: String,
            enum: ['Mandatory', 'Optional'],
            required: [true, "Holiday Category is required"]
        },
        description: {
            type: String,
            trim: true
            // Optional
        },
        applicableLocations: {
            type: [String],
            default: []
        },
        isRecurring: {
            type: Boolean,
            default: false
        },
        recurrenceRule: {
            type: String,
            enum: ['Yearly', 'None'],
            default: 'None'
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// Compound index to prevent duplicate holidays on the same date for the same company
holidaySchema.index({ companyId: 1, holidayDate: 1 }, { unique: true });

export const Holiday = mongoose.model("Holiday", holidaySchema);
