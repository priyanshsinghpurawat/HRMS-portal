import express from 'express';
import { connectDB } from './config/db.js';
import app from './app.js';
import env from 'dotenv';

env.config();

const PORT = process.env.PORT || 5000;

async function server() {
    try {
        app.listen(PORT, () => console.log('server is running on port', PORT));
        await connectDB();
    } catch (error) {
        console.log({
            succuss: false,
            message: "failed to start server",
            error: error.message
        })
    }
}
server();

