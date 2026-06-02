import { z } from "zod";

const certificationBaseValidationSchema = z.object({

    certificationName: z
        .string({
            required_error:
                "Certification name is required"
        })
        .trim()
        .min(
            1,
            "Certification name is required"
        )
        .max(
            100,
            "Certification name cannot exceed 100 characters"
        ),

    issuingOrganization: z
        .string({
            required_error:
                "Issuing organization is required"
        })
        .trim()
        .min(
            1,
            "Issuing organization is required"
        )
        .max(
            100,
            "Organization name cannot exceed 100 characters"
        ),

    issueDate: z.coerce.date({
        required_error:
            "Issue date is required",
        invalid_type_error:
            "Invalid issue date"
    }),

    expirationDate: z
        .coerce
        .date({
            invalid_type_error:
                "Invalid expiration date"
        })
        .nullable()
        .optional(),

    doesNotExpire: z
        .coerce
        .boolean()
        .optional()
        .default(false),

    credentialId: z
        .string()
        .trim()
        .max(
            100,
            "Credential ID cannot exceed 100 characters"
        )
        .optional()
        .or(z.literal("")),

    credentialUrl: z
        .string()
        .trim()
        .url("Invalid credential URL")
        .optional()
        .or(z.literal("")),

    description: z
        .string()
        .trim()
        .max(
            500,
            "Description cannot exceed 500 characters"
        )
        .optional()
        .or(z.literal(""))
});

/**
 * Create Certification Validation
 */
export const certificationValidationSchema =
    certificationBaseValidationSchema.refine(
        (data) => {

            if (
                data.expirationDate &&
                data.issueDate >
                    data.expirationDate
            ) {
                return false;
            }

            return true;
        },
        {
            message:
                "Expiration date cannot be before issue date",
            path: ["expirationDate"]
        }
    );

/**
 * Update Certification Validation
 */
export const updateCertificationValidationSchema =
    certificationBaseValidationSchema.partial();