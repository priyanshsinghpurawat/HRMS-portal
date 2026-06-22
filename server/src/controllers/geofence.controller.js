import { Geofence } from "../models/Geofence.model.js";
import { Company } from "../models/Company.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Create or Update Geofence for a branch
// @route   POST /api/geofence
// @access  HR/Admin
export const setupGeofence = asyncHandler(async (req, res) => {
    const { companyId, branchName, latitude, longitude, allowedRadius, isActive } = req.body;

    if (!companyId || !branchName || !latitude || !longitude) {
        throw new ApiError(400, "Please provide companyId, branchName, latitude, and longitude");
    }

    // Check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    let geofence = await Geofence.findOne({ companyId, branchName });

    if (geofence) {
        // Update existing geofence
        geofence.location = {
            type: "Point",
            coordinates: [longitude, latitude]
        };
        if (allowedRadius !== undefined) geofence.allowedRadius = allowedRadius;
        if (isActive !== undefined) geofence.isActive = isActive;
        
        await geofence.save();
        return res.status(200).json(new ApiResponse(200, geofence, "Geofence updated successfully"));
    } else {
        // Create new geofence
        geofence = await Geofence.create({
            companyId,
            branchName,
            location: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            allowedRadius: allowedRadius || 100,
            isActive: isActive !== undefined ? isActive : true
        });

        return res.status(201).json(new ApiResponse(201, geofence, "Geofence created successfully"));
    }
});

// @desc    Get all Geofences for a company
// @route   GET /api/geofence/:companyId
// @access  HR/Admin
export const getGeofences = asyncHandler(async (req, res) => {
    const { companyId } = req.params;

    const geofences = await Geofence.find({ companyId });

    if (!geofences || geofences.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No geofences found for this company"));
    }

    return res.status(200).json(new ApiResponse(200, geofences, "Geofences retrieved successfully"));
});
