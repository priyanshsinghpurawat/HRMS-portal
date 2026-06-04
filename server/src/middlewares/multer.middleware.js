import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

// Setup memory storage
const storage = multer.memoryStorage();

// Profile Image Filter (JPG, JPEG, PNG, WEBP)
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed for images."), false);
    }
};

// Resume Filter (PDF, DOC, DOCX)
const resumeFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Invalid file type. Only PDF, DOC, and DOCX are allowed for resumes."), false);
    }
};

const certificateFileFilter = (
    req,
    file,
    cb
) => {

    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf"
    ];

    if (
        allowedMimeTypes.includes(file.mimetype)
    ) {
        cb(null, true);
    } else {
        cb(
            new ApiError(
                400,
                "Only JPG, JPEG, PNG, WEBP and PDF files are allowed"
            ),
            false
        );
    }
};

export const uploadCertificate = multer({
    storage,
    fileFilter: certificateFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

export const uploadImage = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit
    }
});

export const uploadResume = multer({
    storage,
    fileFilter: resumeFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    }
});
