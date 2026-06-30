import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { logger } from "./utils/logger.js";
import { recordRequest } from "./controllers/health.controller.js";

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
import geofenceRouter from './routes/geofence.routes.js';
import attendanceRouter from './routes/attendance.routes.js';
import feedbackRouter from './routes/feedback.routes.js';
import companyAttendanceRouter from './routes/companyAttendance.routes.js';
import payrollSettingsRouter from './routes/payrollSettings.routes.js';
import salaryRouter from './routes/salary.routes.js';
import { 
    companyPolicyRouter, 
    hrLeaveRouter, 
    employeeLeaveRouter, 
    employeeBalanceRouter 
} from './routes/leave.routes.js';
import holidayRouter from './routes/holiday.routes.js';
import payrollRouter from './routes/payroll.routes.js';
import {
    companyPayslipRouter,
    employeePayslipRouter
} from './routes/payslip.routes.js';
import reportsRouter from './routes/reports.routes.js';
import automationRouter from './routes/automation.routes.js';
import healthRouter from './routes/health.routes.js';
import faqRouter from './routes/faq.routes.js';
import notificationRouter from './routes/notification.routes.js';

// Error Handler
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();


app.use(
    cors({
        origin: [process.env.CORS_ORIGIN , "http://localhost:5173", "http://localhost:5000"],
        credentials: true,
    })
);

app.use(helmet());
app.use(compression()); // Compress responses

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Request Logging using Morgan + Winston
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// Simple Metrics collection
app.use((req, res, next) => {
    recordRequest();
    next();
});

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
app.use('/api/v1/geofence', geofenceRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/company/attendance', companyAttendanceRouter);
app.use('/api/v1/company/payroll-settings', payrollSettingsRouter);
app.use('/api/v1/company/employees/:employeeId/salary', salaryRouter);

// Leave Management Routes
app.use('/api/v1/company/leave-policies', companyPolicyRouter);
app.use('/api/v1/company/leaves', hrLeaveRouter);
app.use('/api/v1/company/employees/:employeeId', employeeBalanceRouter);
app.use('/api/v1/leaves', employeeLeaveRouter);
app.use('/api/v1/company/holidays', holidayRouter);
app.use('/api/v1/company/payroll', payrollRouter);
app.use('/api/v1/company/payslips', companyPayslipRouter);
app.use('/api/v1/company/reports', reportsRouter);
app.use('/api/v1/company/automation', automationRouter);
app.use('/api/v1/payslips', employeePayslipRouter);
app.use('/api/v1/faqs', faqRouter);
app.use('/api/v1/notifications', notificationRouter);

// New dedicated Enterprise Health and Metrics router
app.use('/api/v1/system', healthRouter);

// Legacy health check (retained for backward compatibility or simple load balancer pings)
app.get("/health", (req, res) => {
    res.status(200).send("Server working fine");
});


app.use(errorHandler);

export { app };