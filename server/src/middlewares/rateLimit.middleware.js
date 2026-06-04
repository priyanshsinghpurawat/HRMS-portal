import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
    windowMs:  30 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many login attempts from this IP, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
