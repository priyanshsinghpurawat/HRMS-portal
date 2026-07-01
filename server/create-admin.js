import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/User.model.js";

dotenv.config();

const createAdmin = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");

        const existingAdmin = await User.findOne({ email: "admin@jobdekho.com" });
        if (existingAdmin) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const admin = await User.create({
            name: "System Admin",
            email: "admin@jobdekho.com",
            password: "Password123!",
            role: "admin",
            isEmailVerified: true
        });

        console.log("Admin user created successfully:", admin.email);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
