import { Company } from "../models/Company.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { companyProfileSchema } from "../validations/company.validation.js";

const companyProfile = asyncHandler(async (req, res) => {
    const validationResult = companyProfileSchema.safeParse({ body: req.body });
    
    if (!validationResult.success) {
        const formattedErrors = validationResult.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));
        throw new ApiError(400, "Validation Error", formattedErrors);
    }

    const {
        name,
        description,
        website,
        location,
        socialLinks,
        tanId,
        gstId
    } = validationResult.data.body;


    // Check existing company data
    const existingCompany = await Company.findOne({
        $or: [
            { name },
            { website },
            { tanId },
            { gstId }
        ]
    });

    if (existingCompany) {
        if (existingCompany.name === name) {
            throw new ApiError(409, "Company name already exists");
        }

        if (existingCompany.website === website) {
            throw new ApiError(409, "Website already exists");
        }

        if (existingCompany.tanId === tanId) {
            throw new ApiError(409, "TAN ID already exists");
        }

        if (existingCompany.gstId === gstId) {
            throw new ApiError(409, "GST ID already exists");
        }
    }

    // Create company profile
    const company = await Company.create({
        name,
        description,
        website,
        location,
        socialLinks,
        tanId,
        gstId,
        isProfileCompleted: true
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            company,
            "Company profile created successfully"
        )
    );
});

export { companyProfile };
