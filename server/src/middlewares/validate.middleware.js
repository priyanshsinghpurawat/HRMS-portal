import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

/**
 * Middleware to validate requests using Zod schemas
 */
export const validate = (schema) => async (req, res, next) => {

    try {

        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        return next();

    } catch (error) {

        if (error instanceof ZodError) {

            const formattedErrors = error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));

            return next(
                new ApiError(
                    400,
                    "Validation Error",
                    formattedErrors
                )
            );
        }

        return next(error);
    }
};

export const validateRequest = validate;