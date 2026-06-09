import { Job } from "../models/Job.model.js";
import { HR } from "../models/HR.model.js";
import { Company } from "../models/Company.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateJobWithAI } from "../services/moderation.service.js";
import { processJobMatchNotifications } from "../services/jobMatching.service.js";
import mongoose from "mongoose";

// ==========================================
// HR Job Controllers
// ==========================================

export const createJob = asyncHandler(async (req, res) => {
    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found. Only HR accounts can create job postings.");
    }

    const {
        title,
        description,
        department,
        employmentType,
        experienceLevel,
        salaryMin,
        salaryMax,
        location,
        skills,
        openings
    } = req.body;

    // Run AI Moderation check before saving
    const moderation = await validateJobWithAI({
        title,
        description,
        department,
        employmentType,
        experienceLevel,
        salaryMin,
        salaryMax,
        location,
        skills
    });

    if (!moderation.isSafe) {
        return res.status(400).json({
            success: false,
            message: "Job posting blocked due to policy violations",
            reasons: moderation.reasons
        });
    }

    const job = await Job.create({
        title,
        description,
        company: hr.company,
        createdBy: hr._id,
        department,
        employmentType,
        experienceLevel,
        salaryMin,
        salaryMax,
        location,
        skills: skills || [],
        openings: openings || 1,
        status: "active",
        aiModeration: {
            isChecked: true,
            isSafe: true,
            riskScore: moderation.riskScore,
            reasons: moderation.reasons,
            checkedAt: new Date()
        }
    });

    // Trigger candidate job matching process asynchronously
    processJobMatchNotifications(job);

    return res.status(201).json(new ApiResponse(201, job, "Job posting created successfully and passed AI moderation"));
});

export const getMyJobs = asyncHandler(async (req, res) => {
    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found.");
    }

    const jobs = await Job.find({ createdBy: hr._id, isDeleted: false });
    return res.status(200).json(new ApiResponse(200, jobs, "My job listings fetched successfully"));
});

export const getJobById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found.");
    }

    const job = await Job.findOne({ _id: id, isDeleted: false })
        .populate("company", "name logo website description")
        .populate({
            path: "createdBy",
            populate: {
                path: "user",
                select: "name email phone"
            }
        });

    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    // Security rule: HR can access only jobs belonging to their company
    if (job.company._id.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You do not have permission to view jobs for another company");
    }

    return res.status(200).json(new ApiResponse(200, job, "Job details fetched successfully"));
});

export const updateJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found.");
    }

    const job = await Job.findOne({ _id: id, isDeleted: false });
    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    // Security check
    if (job.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You do not have permission to modify jobs for another company");
    }

    // If title or description is being modified, run AI moderation on the updated fields
    const newTitle = req.body.title !== undefined ? req.body.title : job.title;
    const newDescription = req.body.description !== undefined ? req.body.description : job.description;

    if (req.body.title !== undefined || req.body.description !== undefined) {
        const moderation = await validateJobWithAI({
            title: newTitle,
            description: newDescription,
            department: req.body.department || job.department,
            employmentType: req.body.employmentType || job.employmentType,
            experienceLevel: req.body.experienceLevel || job.experienceLevel,
            salaryMin: req.body.salaryMin || job.salaryMin,
            salaryMax: req.body.salaryMax || job.salaryMax,
            location: req.body.location || job.location,
            skills: req.body.skills || job.skills
        });

        if (!moderation.isSafe) {
            return res.status(400).json({
                success: false,
                message: "Job update blocked due to policy violations",
                reasons: moderation.reasons
            });
        }

        job.aiModeration = {
            isChecked: true,
            isSafe: true,
            riskScore: moderation.riskScore,
            reasons: moderation.reasons,
            checkedAt: new Date()
        };
    }

    // Update fields
    const allowedUpdates = [
        "title",
        "description",
        "department",
        "employmentType",
        "experienceLevel",
        "salaryMin",
        "salaryMax",
        "location",
        "skills",
        "openings",
        "status"
    ];

    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            job[key] = req.body[key];
        }
    }

    await job.save();
    return res.status(200).json(new ApiResponse(200, job, "Job posting updated successfully"));
});

export const closeJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found.");
    }

    const job = await Job.findOne({ _id: id, isDeleted: false });
    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    if (job.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You do not have permission to close jobs for another company");
    }

    job.status = "closed";
    await job.save();

    return res.status(200).json(new ApiResponse(200, job, "Job listing closed successfully"));
});

export const reopenJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found.");
    }

    const job = await Job.findOne({ _id: id, isDeleted: false });
    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    if (job.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You do not have permission to reopen jobs for another company");
    }

    job.status = "active";
    await job.save();

    return res.status(200).json(new ApiResponse(200, job, "Job listing reopened successfully"));
});

export const deleteJob = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(404, "HR profile not found.");
    }

    const job = await Job.findOne({ _id: id, isDeleted: false });
    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    if (job.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You do not have permission to delete jobs for another company");
    }

    job.isDeleted = true;
    job.deletedAt = new Date();
    await job.save();

    return res.status(200).json(new ApiResponse(200, null, "Job listing soft-deleted successfully"));
});

// ==========================================
// Public Candidate Controllers
// ==========================================

export const getPublicActiveJobs = asyncHandler(async (req, res) => {
    const { location, department, employmentType, experienceLevel } = req.query;

    const filter = {
        status: "active",
        isDeleted: false,
        "aiModeration.isSafe": true // Only list AI safe jobs publicly
    };

    if (location) {
        filter.location = { $regex: location, $options: "i" };
    }
    if (department) {
        filter.department = { $regex: department, $options: "i" };
    }
    if (employmentType) {
        filter.employmentType = employmentType;
    }
    if (experienceLevel) {
        filter.experienceLevel = experienceLevel;
    }

    const jobs = await Job.find(filter)
        .populate("company", "name logo website")
        .select("-aiModeration"); // Exclude moderation scores from public list

    return res.status(200).json(new ApiResponse(200, jobs, "Active jobs fetched successfully"));
});

export const getPublicJobDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const job = await Job.findOne({ _id: id, status: "active", isDeleted: false, "aiModeration.isSafe": true })
        .populate("company", "name logo website description")
        .select("-aiModeration");

    if (!job) {
        throw new ApiError(404, "Active job listing not found");
    }

    return res.status(200).json(new ApiResponse(200, job, "Job details fetched successfully"));
});
