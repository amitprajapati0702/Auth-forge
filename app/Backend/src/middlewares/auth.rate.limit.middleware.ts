import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { sendRedisCommand } from "../infrastructure/redis/index.js";

export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,    // max 10 login attempts per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: true,    // Fail-open: don't crash login if Redis has a transient issue
    store: new RedisStore({
        sendCommand: (...args: string[]) => sendRedisCommand(...args) as any,
        prefix: "rate:auth:",
    }),
    message: {
        success: false,
        message: "Too many login attempts. Please try again later.",
        error: { code: "RATE_LIMIT_EXCEEDED" },
    },
});