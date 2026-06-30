import Redis from "ioredis";
import { logger } from "../../utils/logger.js";

// Singleton Redis instance
let redisClient = null;

if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            if (times > 3) return null; // Stop retrying
            return Math.min(times * 50, 2000);
        }
    });

    redisClient.on('connect', () => logger.info('Redis connected successfully'));
    redisClient.on('error', (err) => logger.error(`Redis connection error: ${err.message}`));
}

/**
 * Get value from cache
 */
export const getCache = async (key) => {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logger.error(`Cache GET error: ${error.message}`);
        return null;
    }
};

/**
 * Set value in cache with optional TTL
 */
export const setCache = async (key, value, ttlSeconds = 3600) => {
    if (!redisClient) return;
    try {
        await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
        logger.error(`Cache SET error: ${error.message}`);
    }
};

/**
 * Delete value from cache
 */
export const delCache = async (key) => {
    if (!redisClient) return;
    try {
        await redisClient.del(key);
    } catch (error) {
        logger.error(`Cache DEL error: ${error.message}`);
    }
};
