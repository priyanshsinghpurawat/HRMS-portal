import { Offer } from "../models/Offer.model.js";
import { Application } from "../models/Application.model.js";
import { HR } from "../models/HR.model.js";
import { Company } from "../models/Company.model.js";
import { User } from "../models/User.model.js";
import { Notification } from "../models/Notification.model.js";
import { Job } from "../models/Job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendOfferLetterEmail } from "../services/email.service.js";
import mongoose from "mongoose";

export const createOffer = asyncHandler(async (req, res) => {
    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied: Only HR accounts can generate offers");
    }

    const { applicationId, designation, department, annualCTC, joiningDate } = req.body;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
        throw new ApiError(400, "Invalid Application ID format");
    }

    const application = await Application.findById(applicationId).populate("applicant job");
    if (!application) {
        throw new ApiError(404, "Application record not found");
    }

    // Security check: HR company matches application's job company
    if (application.job.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot issue offers for another company's listings");
    }

    let offerLetterUrl = req.body.offerLetterUrl || "";

    // If offer letter file is uploaded, upload to Cloudinary
    if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file.buffer, "job_portal/offers", "auto");
        if (!uploadResult) {
            throw new ApiError(500, "Failed to upload offer letter to cloud storage");
        }
        offerLetterUrl = uploadResult.secure_url;
    }

    if (!offerLetterUrl) {
        throw new ApiError(400, "Offer letter document or url is required");
    }

    // Create the Offer record
    const offer = await Offer.create({
        application: applicationId,
        candidate: application.applicant._id,
        company: hr.company,
        designation,
        department,
        annualCTC: Number(annualCTC),
        joiningDate: new Date(joiningDate),
        offerLetterUrl,
        status: "sent"
    });

    // Automatically transition application status to OFFER_SENT
    application.internalStatus = "OFFER_SENT";
    await application.save();

    // Notify candidate in database
    const company = await Company.findById(hr.company);
    await Notification.create({
        user: application.applicant._id,
        type: "info",
        message: `You have received a job offer for the position of ${designation} at ${company?.name || "the company"}.`,
        metadata: {
            offerId: offer._id,
            applicationId: application._id
        }
    });

    // Send Offer email
    const candidateUser = await User.findById(application.applicant._id);
    if (candidateUser) {
        await sendOfferLetterEmail({
            to: candidateUser.email,
            name: candidateUser.name,
            designation,
            companyName: company?.name || "the company",
            annualCTC: Number(annualCTC),
            joiningDate,
            offerLetterUrl
        });
    }

    return res.status(201).json(new ApiResponse(201, offer, "Job offer generated and candidate notified successfully"));
});

export const getOfferById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Offer ID format");
    }

    const offer = await Offer.findById(id).populate("company", "name logo website");
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    // Security check: Candidate or HR belonging to the company can view
    const hr = await HR.findOne({ user: req.user._id });
    const isHrOwner = hr && hr.company.toString() === offer.company.toString();
    const isCandidateOwner = req.user._id.toString() === offer.candidate.toString();

    if (!isHrOwner && !isCandidateOwner) {
        throw new ApiError(403, "Access Denied: You do not have permission to view this offer");
    }

    return res.status(200).json(new ApiResponse(200, offer, "Offer retrieved successfully"));
});

export const getMyOffers = asyncHandler(async (req, res) => {
    const offers = await Offer.find({ candidate: req.user._id })
        .populate("company", "name logo website")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, offers, "Offers fetched successfully"));
});

export const resendOffer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Offer ID format");
    }

    const hr = await HR.findOne({ user: req.user._id });
    if (!hr) {
        throw new ApiError(403, "Access Denied: Only HR accounts can resend offers");
    }

    const offer = await Offer.findById(id).populate("candidate");
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    if (offer.company.toString() !== hr.company.toString()) {
        throw new ApiError(403, "Access Denied: You cannot manage offers for another company");
    }

    const company = await Company.findById(hr.company);
    await sendOfferLetterEmail({
        to: offer.candidate.email,
        name: offer.candidate.name,
        designation: offer.designation,
        companyName: company?.name || "the company",
        annualCTC: offer.annualCTC,
        joiningDate: offer.joiningDate,
        offerLetterUrl: offer.offerLetterUrl
    });

    return res.status(200).json(new ApiResponse(200, null, "Offer letter resent to candidate email"));
});

export const acceptOffer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Offer ID format");
    }

    const offer = await Offer.findById(id);
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    if (offer.candidate.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access Denied: You do not own this offer");
    }

    offer.status = "accepted";
    await offer.save();

    // Transition application status to OFFER_ACCEPTED
    const application = await Application.findById(offer.application);
    if (application) {
        application.internalStatus = "OFFER_ACCEPTED";
        await application.save();
    }

    // Notify HR
    const company = await Company.findById(offer.company);
    const job = application ? await Job.findById(application.job) : null;
    if (job) {
        const jobHR = await HR.findById(job.createdBy).populate("user", "email");
        if (jobHR?.user) {
            await Notification.create({
                user: jobHR.user._id,
                type: "info",
                message: `Candidate ${req.user.name} has accepted the offer for ${offer.designation}.`,
                metadata: {
                    offerId: offer._id,
                    applicationId: offer.application
                }
            });
        }
    }

    return res.status(200).json(new ApiResponse(200, offer, "Offer accepted successfully"));
});

export const rejectOffer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Offer ID format");
    }

    const offer = await Offer.findById(id);
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    if (offer.candidate.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Access Denied: You do not own this offer");
    }

    offer.status = "rejected";
    await offer.save();

    // Reject application -> NOT_SELECTED
    const application = await Application.findById(offer.application);
    if (application) {
        application.internalStatus = "NOT_SELECTED";
        await application.save();
    }

    return res.status(200).json(new ApiResponse(200, offer, "Offer declined successfully"));
});
