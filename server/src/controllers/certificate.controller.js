import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { Certification } from "../models/Certificate.model.js";
import { certificationValidationSchema , updateCertificationValidationSchema } from "../validations/certification.validate.js";

import {
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/cloudinary.js";

export const createCertification = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const validationResult = certificationValidationSchema.safeParse(req.body);

    if (!validationResult.success) {
        const formattedErrors = validationResult.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
        }));
        throw new ApiError(400, "Validation Error", formattedErrors);
    }

    const {
        certificationName,
        issuingOrganization,
        issueDate,
        expirationDate,
        doesNotExpire,
        credentialId,
        credentialUrl,
        description
    } = validationResult.data;

    // Prevent duplicate certifications
    const existingCertification =
        await Certification.findOne({
            user: user._id,
            certificationName,
            issuingOrganization,
            credentialId
        });

    if (existingCertification) {
        throw new ApiError(
            409,
            "Certification already exists"
        );
    }

    /**
     * Certificate Upload
     */
    let certificate = {
        url: "",
        public_id: ""
    };

    if (req.file) {

        // Allowed file types
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf"
        ];

        // Validate file type
        if (
            !allowedMimeTypes.includes(req.file.mimetype)
        ) {
            throw new ApiError(
                400,
                "Only JPG, JPEG, PNG and PDF files are allowed"
            );
        }

        // Upload to cloudinary
        const uploadedCertificate =
            await uploadOnCloudinary(
                req.file.buffer
            );

        if (!uploadedCertificate) {
            throw new ApiError(
                500,
                "Failed to upload certificate"
            );
        }

        certificate = {
            url: uploadedCertificate.secure_url.includes(".pdf") ? uploadedCertificate.secure_url.replace("/upload/", "/upload/f_auto/") : uploadedCertificate.secure_url,
            public_id: uploadedCertificate.public_id
        };
    }

    // Create certification
    const certification =
        await Certification.create({
            user: user._id,
            certificationName,
            issuingOrganization,
            issueDate,
            expirationDate,
            doesNotExpire,
            credentialId,
            credentialUrl,
            description,
            certificate
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            certification,
            "Certification created successfully"
        )
    );
});

export const updateCertification = asyncHandler(async (req, res) => {

    const { certificationId } = req.params;

    const certification =
        await Certification.findById(
            certificationId
        );

    if (!certification) {
        throw new ApiError(
            404,
            "Certification not found"
        );
    }

    // Ownership check
    if (
        certification.user.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to update this certification"
        );
    }

    // Validate incoming data
    const validationResult =
        updateCertificationValidationSchema
            .safeParse(req.body);

    if (!validationResult.success) {

        const formattedErrors =
            validationResult.error.issues.map(
                (err) => ({
                    field: err.path.join("."),
                    message: err.message
                })
            );

        throw new ApiError(
            400,
            "Validation Error",
            formattedErrors
        );
    }

    const allowedFields = [
        "certificationName",
        "issuingOrganization",
        "issueDate",
        "expirationDate",
        "doesNotExpire",
        "credentialId",
        "credentialUrl",
        "description"
    ];

    // Update allowed fields only
    allowedFields.forEach((field) => {

        if (
            validationResult.data[field] !==
            undefined
        ) {
            certification[field] =
                validationResult.data[field];
        }

    });

    /**
     * Remove expiration date
     * if certification does not expire
     */
    if (certification.doesNotExpire) {
        certification.expirationDate = null;
    }

    /**
     * Certificate Upload
     */
    if (req.file) {

        // Allowed file types
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf"
        ];

        // Validate file type
        if (
            !allowedMimeTypes.includes(
                req.file.mimetype
            )
        ) {
            throw new ApiError(
                400,
                "Only JPG, JPEG, PNG and PDF files are allowed"
            );
        }

        // Delete old certificate
        if (
            certification.certificate?.public_id
        ) {
            await deleteFromCloudinary(
                certification.certificate.public_id
            );
        }

        // Upload new certificate
        const uploadedCertificate =
            await uploadOnCloudinary(
                req.file.buffer
            );

        if (!uploadedCertificate) {
            throw new ApiError(
                500,
                "Failed to upload certificate"
            );
        }

        certification.certificate = {
            url:
                uploadedCertificate.secure_url.includes(".pdf")
                    ? uploadedCertificate.secure_url.replace(
                        "/upload/",
                        "/upload/f_auto/"
                    )
                    : uploadedCertificate.secure_url,

            public_id:
                uploadedCertificate.public_id
        };
    }

    await certification.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            certification,
            "Certification updated successfully"
        )
    );
});

export const deleteCertification = asyncHandler(async (req, res) => {

    const { certificationId } = req.params;

    const certification =
        await Certification.findById(
            certificationId
        );

    if (!certification) {
        throw new ApiError(
            404,
            "Certification not found"
        );
    }

    // Ownership check
    if (
        certification.user.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to delete this certification"
        );
    }

    /**
     * Delete certificate from cloudinary
     */
    if (
        certification.certificate?.public_id
    ) {
        await deleteFromCloudinary(
            certification.certificate.public_id
        );
    }

    await certification.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Certification deleted successfully"
        )
    );
});