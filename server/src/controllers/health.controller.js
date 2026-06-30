import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// A simple in-memory metric store for basic observability without external dependencies
const systemMetrics = {
    startTime: Date.now(),
    requestsProcessed: 0,
    errorsLogged: 0
};

export const recordRequest = () => {
    systemMetrics.requestsProcessed++;
};

export const recordError = () => {
    systemMetrics.errorsLogged++;
};

export const getHealthStatus = asyncHandler(async (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    let dbStatusText = 'Unknown';
    switch (dbStatus) {
        case 0: dbStatusText = 'Disconnected'; break;
        case 1: dbStatusText = 'Connected'; break;
        case 2: dbStatusText = 'Connecting'; break;
        case 3: dbStatusText = 'Disconnecting'; break;
    }

    const health = {
        status: dbStatus === 1 ? 'OK' : 'DEGRADED',
        database: dbStatusText,
        uptimeSeconds: Math.floor((Date.now() - systemMetrics.startTime) / 1000),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
    };

    const statusCode = dbStatus === 1 ? 200 : 503;
    return res.status(statusCode).json(new ApiResponse(statusCode, health, "System Health Status"));
});

export const getMetrics = asyncHandler(async (req, res) => {
    const metrics = {
        uptimeSeconds: Math.floor((Date.now() - systemMetrics.startTime) / 1000),
        requestsProcessed: systemMetrics.requestsProcessed,
        errorsLogged: systemMetrics.errorsLogged,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
    };

    return res.status(200).json(new ApiResponse(200, metrics, "System Metrics"));
});
