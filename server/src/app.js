import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true
    })
);

app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import Routes
import authRouter from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import educationRouter from "./routes/education.routes.js";

// Routes Declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/education",educationRouter);

// Global Error Handler
import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);

export { app };
