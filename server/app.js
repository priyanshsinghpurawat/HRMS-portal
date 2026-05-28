import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import { router } from './routes/userRoute.js';

const app = express();

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use('/api/user', router);

export default app;