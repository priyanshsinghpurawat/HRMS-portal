import mongoose from "mongoose";

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        return console.log('mongodb connect succussfully!!');
    } catch (error) {
        console.log(`failed to connect database: ${connectDB}`);
    };
};

export { connectDB };