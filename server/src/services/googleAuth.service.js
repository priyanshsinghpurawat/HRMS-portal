import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../utils/ApiError.js";

const client = new OAuth2Client();

/**
 * Verify Google ID token and retrieve user profile details.
 * Supports both web and mobile client audiences.
 * @param {string} idToken - The Google ID Token from the client
 * @returns {Promise<Object>} The verified user payload
 */
export const verifyGoogleToken = async (idToken) => {
    const webClientId = process.env.GOOGLE_CLIENT_ID;
    const mobileClientId = process.env.GOOGLE_CLIENT_ID_MOBILE;

    if (!webClientId) {
        throw new ApiError(500, "Google Client ID config is missing on the server.");
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: [webClientId, mobileClientId].filter(Boolean)
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new ApiError(400, "Invalid Google ID token payload.");
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified
        };
    } catch (error) {
        console.error("Google token verification error:", error);
        throw new ApiError(400, error.message || "Google ID token verification failed.");
    }
};
