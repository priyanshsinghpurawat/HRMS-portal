import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./swagger.js";

// Routes
import authRouter from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import educationRouter from "./routes/education.routes.js";
import certificateRouter from "./routes/certificate.routes.js";
import experienceRouter from "./routes/experience.routes.js";
import adminRouter from "./routes/admin.routes.js";
import companyRouter from './routes/company.route.js';
import hrRouter from './routes/hr.routes.js';
import jobRouter from './routes/job.routes.js';
import applicationRouter from './routes/application.routes.js';
import offerRouter from './routes/offer.routes.js';
import { employeeHRRouter, employeeSelfRouter } from './routes/employee.routes.js';

// Error Handler
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();


app.use(
    cors({
        origin: [process.env.CORS_ORIGIN , "http://localhost:5173"],
        credentials: true,
    })
);

app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/education", educationRouter);
app.use("/api/v1/certificates", certificateRouter);
app.use("/api/v1/experience", experienceRouter);
app.use("/api/v1/admin", adminRouter);
app.use('/api/v1/company',companyRouter);
app.use('/api/v1/hr', hrRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/offers', offerRouter);
app.use('/api/v1/employees', employeeHRRouter);
app.use('/api/v1/employee', employeeSelfRouter);

app.get("/health", (req, res) => {
    res.status(200).send("Server working fine");
});


app.use(errorHandler);

export { app };