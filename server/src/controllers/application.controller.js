import { Application } from "../models/Application.model.js";
import { Job } from "../models/Job.model.js";
import { HR } from "../models/HR.model.js";
import { Profile } from "../models/Profile.model.js";
import { Notification } from "../models/Notification.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { screenApplication } from "../services/applicationScreening.service.js";
import { getRecommendedJobs } from "../services/jobRecommendation.service.js";
import { createEmployeeFromApplication } from "../services/employeeOnboarding.service.js";
import {
    sendApplicationSubmittedEmail,
    sendApplicationStatusUpdateEmail,
    sendRejectionWithRecommendationsEmail
} from "../services/email.service.js";
import mongoose from "mongoose";

/**
 * Filter application payload to applicant-safe properties
 */
const getSafeApplication = (app, recommendations = []) => {
    const jobObj = app.job && app.job.title ? {
        _id: app.job._id,
        title: app.job.title,
        department: app.job.department,
        employmentType: app.job.employmentType,
        location: app.job.location,
        company: app.job.company
    } : app.job;

    return {
        _id: app._id,
        job: jobObj,
        coverLetter: app.coverLetter,
        resume: app.resume,
        candidateStatus: app.candidateStatus,
        appliedAt: app.appliedAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        ...(app.internalStatus === "NOT_SELECTED" && { recommendations })
    };
};

// ==========================================
// Candidate Endpoints
// ==========================================

export const applyToJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const job = await Job.findOne({ _id: jobId, isDeleted: false, status: "active" });
    if (!job) {
        throw new ApiError(404, "Active Job listing not found");
    }

    // Check duplicate applications
    const existingApplication = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existingApplication) {
        throw new ApiError(409, "You have already applied for this job listing");
    }

    let resumeUrl = "";

    // 1. Process new resume upload if attached
    if (req.file) {
        if (req.file.size > 10 * 1024 * 1024) {
            throw new ApiError(400, "Resume file size cannot exceed 10 MB");
        }
        const uploadResult = await uploadOnCloudinary(req.file.buffer, "job_portal/resumes", "auto");
        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload resume to cloud storage");
        }
        resumeUrl = uploadResult.secure_url.replace("/upload/", "/upload/f_auto/");
    } else {
        // Fallback to profile resume
        const profile = await Profile.findOne({ user: req.user._id });
        if (profile?.resume?.url) {
            resumeUrl = profile.resume.url;
        }
    }

    if (!resumeUrl) {
        throw new ApiError(400, "A resume is required to apply. Please upload one or add to your profile.");
    }

    const application = await Application.create({
        job: jobId,
        applicant: req.user._id,
        resume: resumeUrl,
        coverLetter: req.body.coverLetter || "",
        internalStatus: "APPLIED"
    });

    // Notify candidate
    await Notification.create({
        user: req.user._id,
        type: "application_received",
        message: "Your application has been received successfully.",
        metadata: { jobId, applicationId: application._id }
    });

    // Send confirmation email
    await sendApplicationSubmittedEmail({
        to: req.user.email,
        name: req.user.name,
        jobTitle: job.title,
        companyName: "the company" // Populated inside email later or loaded
    });

    // Notify HR
    const jobHR = await HR.findById(job.createdBy).populate("user", "email");
    if (jobHR?.user) {
        await Notification.create({
            user: jobHR.user._id,
            type: "info",
            message: `New application received for "${job.title}" by ${req.user.name}.`,
            metadata: { jobId, applicationId: application._id }
        });
    }

    // Run AI screening in background
    screenApplication(application._id);

    return res.status(201).json(new ApiResponse(201, getSafeApplication(application), "Application submitted successfully"));
});

export const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find({ applicant: req.user._id })
        .populate({
            path: "job",
            select: "title department employmentType location company",
            populate: {
                path: "company",
                select: "name logo"
            }
        })
        .sort({ appliedAt: -1 });

    const safeApplications = [];
    for (const app of applications) {
        let recommendations = [];
        if (app.internalStatus === "NOT_SELECTED") {
            recommendations = await getRecommendedJobs(req.user._id);
        }
        safeApplications.push(getSafeApplication(app, recommendations));
    }

    return res.status(200).json(new ApiResponse(200, safeApplications, "Applications fetched successfully"));
});

export const getApplicationDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Application ID format");
    }

    const application = await Application.findOne({ _id: id, applicant: req.user._id })
        .populate({
            path: "job",
            select: "title department employmentType location company",
            populate: {
                path: "company",
                select: "name logo"
            }
        });

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    let recommendations = [];
    if (application.internalStatus === "NOT_SELECTED") {
        recommendations = await getRecommendedJobs(req.user._id);
    }

    return res.status(200).json(new ApiResponse(200, getSafeApplication(application, recommendations), "Application details fetched successfully"));
});

// ==========================================
// HR Endpoints
// ==========================================

export const getJobApplicationsHR = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid Job ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied: Only HR accounts can retrieve applications");
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    // Security check: Verify HR company matches job company
    if (job.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot view applications for another company's job listings");
    }

    const applications = await Application.find({ job: jobId })
        .populate("applicant", "name email phone")
        .sort({ queueRank: 1, aiScore: -1 });

    return res.status(200).json(new ApiResponse(200, applications, "Job applications fetched successfully by HR"));
});

export const updateApplicationStatusHR = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { internalStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Application ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied: Only HR accounts can modify application status");
    }

    const application = await Application.findById(id).populate("job");
    if (!application) {
        throw new ApiError(404, "Application record not found");
    }

    // Security check: HR must own the company listing this job
    if (application.job.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot edit applications for another company's listings");
    }

    application.internalStatus = internalStatus;
    await application.save(); // pre-save hook will automatically assign candidateStatus and sync status field

    // Trigger Employee Onboarding if application is marked as HIRED
    if (internalStatus === "HIRED") {
        await createEmployeeFromApplication(application._id);
    }

    // Retrieve candidate user
    const candidateUser = await User.findById(application.applicant);
    if (candidateUser) {
        // Create DB Notification based on new status
        let type = "info";
        let message = `Your application status for "${application.job.title}" has been updated.`;

        if (internalStatus === "SHORTLISTED") {
            type = "application_shortlisted";
            message = "Your profile has been shortlisted for the next stage.";
        } else if (internalStatus === "INTERVIEW_SCHEDULED") {
            type = "interview_scheduled";
            message = "Your interview has been scheduled.";
        } else if (internalStatus === "SELECTED" || internalStatus === "HIRED") {
            type = "application_hired";
            message = "Congratulations! You have been selected.";
        } else if (internalStatus === "NOT_SELECTED") {
            type = "application_rejected";
            message = "Your application status has been updated. We encourage you to view other matching roles.";
        }

        await Notification.create({
            user: candidateUser._id,
            type,
            message,
            metadata: { jobId: application.job._id, applicationId: application._id }
        });

        // Trigger email
        if (internalStatus === "NOT_SELECTED") {
            const recommendations = await getRecommendedJobs(candidateUser._id);
            await sendRejectionWithRecommendationsEmail({
                to: candidateUser.email,
                name: candidateUser.name,
                jobTitle: application.job.title,
                companyName: "the company", // can be expanded to full company name
                recommendations
            });
        } else {
            await sendApplicationStatusUpdateEmail({
                to: candidateUser.email,
                name: candidateUser.name,
                jobTitle: application.job.title,
                companyName: "the company",
                statusText: application.candidateStatus
            });
        }
    }

    return res.status(200).json(new ApiResponse(200, application, "Application status updated successfully by HR"));
});

export const updateApplicationQueueHR = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { queueStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Application ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied: Only HR accounts can modify application queues");
    }

    const application = await Application.findById(id).populate("job");
    if (!application) {
        throw new ApiError(404, "Application record not found");
    }

    // Security check
    if (application.job.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot edit applications for another company's listings");
    }

    application.queueStatus = queueStatus;

    // Map queue status to corresponding internal status values
    if (queueStatus === "shortlist_queue") {
        application.internalStatus = "SHORTLIST_QUEUE";
    } else if (queueStatus === "hold_queue") {
        application.internalStatus = "HOLD_QUEUE";
    } else if (queueStatus === "review_queue") {
        application.internalStatus = "UNDER_HR_REVIEW";
    }

    await application.save();

    return res.status(200).json(new ApiResponse(200, application, "Application queue reassigned successfully by HR"));
});