import mongoose, { Schema } from "mongoose";

const salaryStructureSchema = new Schema(
    {
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: [true, "Employee ID is required"],
            index: true
        },
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company ID is required"],
            index: true
        },
        salaryType: {
            type: String,
            enum: ["Monthly"],
            default: "Monthly"
        },
        components: {
            basicSalary: { type: Number, required: true, min: 0 },
            hra: { type: Number, required: true, min: 0 },
            specialAllowance: { type: Number, required: true, min: 0 },
            medicalAllowance: { type: Number, required: true, min: 0 },
            conveyanceAllowance: { type: Number, required: true, min: 0 },
            otherAllowances: { type: Number, required: true, min: 0 }
        },
        grossSalary: {
            type: Number,
            required: [true, "Gross salary is required"],
            min: 0
        },
        statutoryDeductions: {
            pfApplicable: { type: Boolean, default: false },
            esicApplicable: { type: Boolean, default: false },
            ptApplicable: { type: Boolean, default: false },
            tdsApplicable: { type: Boolean, default: false }
        },
        effectiveFrom: {
            type: Date,
            required: [true, "Effective from date is required"],
            index: true
        },
        revisionReason: {
            type: String,
            trim: true,
            maxlength: 500
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Created By is required"]
        }
    },
    {
        timestamps: true
    }
);

// Compound index for quick fetching of the current applicable salary for an employee
salaryStructureSchema.index({ employeeId: 1, effectiveFrom: -1 });

// Pre-save hook to validate gross salary summation
salaryStructureSchema.pre("save", function (next) {
    const calculatedGross = 
        (this.components.basicSalary || 0) +
        (this.components.hra || 0) +
        (this.components.specialAllowance || 0) +
        (this.components.medicalAllowance || 0) +
        (this.components.conveyanceAllowance || 0) +
        (this.components.otherAllowances || 0);

    // Using a small epsilon to account for potential floating point inaccuracies
    if (Math.abs(calculatedGross - this.grossSalary) > 0.01) {
        return next(
            new Error(`Validation Error: Sum of components (${calculatedGross}) does not match gross salary (${this.grossSalary})`)
        );
    }
    
    next();
});

export const SalaryStructure = mongoose.model("SalaryStructure", salaryStructureSchema);
