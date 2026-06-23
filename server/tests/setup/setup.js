import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

process.env.RAZORPAY_KEY_ID = 'test_razorpay_key';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret';
process.env.JWT_SECRET_KEY = 'test_jwt_secret';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
process.env.GEMINI_API_KEY = 'test_gemini_key';
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_key';
process.env.CLOUDINARY_API_SECRET = 'test_secret';


let mongoServer;

beforeAll(async () => {
    // Start MongoDB Memory Server as a Replica Set to support transactions
    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const mongoUri = mongoServer.getUri();

    // Connect Mongoose to the Memory Server
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoUri);

    // Create collections for all registered models to avoid WriteConflict during transactions
    const models = Object.values(mongoose.connection.models);
    for (const model of models) {
        await model.createCollection();
    }
}, 120000); // 2 minutes timeout for initial download

beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

afterEach(async () => {
    // Clear all collections after each test to ensure test isolation
    if (mongoose.connection.readyState === 1) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
});

afterAll(async () => {
    // Disconnect and stop memory server
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});
