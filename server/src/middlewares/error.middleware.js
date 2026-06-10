import { ApiError } from "../utils/ApiError.js";

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error("Express Caught Error:", err);
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode ? error.statusCode : 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        success: error.success,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode).json(response);
};
