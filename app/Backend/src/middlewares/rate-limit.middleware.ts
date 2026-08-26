import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { sendRedisCommand } from "../infrastructure/redis/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "../utils/http-status.js";
import { ErrorCodes } from "../utils/error-codes.js";

interface RateLimiterOptions {
    windowMs: number;
    max: number;
    prefix: string;
    message: string;
}

/**
 * Creates a standardized rate limiter using Redis store.
 */
export function createRateLimiter({
    windowMs,
    max,
    prefix,
    message,
}: RateLimiterOptions): RateLimitRequestHandler {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        passOnStoreError: true, // Fail-open: don't block request traffic if Redis has a transient issue
        store: new RedisStore({
            sendCommand: (...args: string[]) => sendRedisCommand(...args) as any,
            prefix: `rate:${prefix}:`,
        }),
        handler: (_req, _res, next) => {
            next(
                new ApiError({
                    statusCode: httpStatus.TOO_MANY_REQUESTS,
                    message,
                    errorcode: ErrorCodes.RATE_LIMIT_EXCEEDED,
                })
            );
        },
    });
}

/**
 * 1. Global API Rate Limiter
 * Applied across all general API routes (100 requests / 15 minutes per IP)
 */
export const globalRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    prefix: "global",
    message: "Too many requests. Please slow down and try again later.",
});

/**
 * 2. User Registration Rate Limiter
 * Applied to POST /api/v1/auth/register (5 requests / 15 minutes per IP)
 */
export const registerRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    prefix: "register",
    message: "Too many registration attempts. Please try again later.",
});

/**
 * 3. User Login Rate Limiter
 * Applied to POST /api/v1/auth/login (10 requests / 15 minutes per IP)
 */
export const loginRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    prefix: "login",
    message: "Too many login attempts. Please try again later.",
});

/**
 * 4. Sensitive OTP & Password Flow Rate Limiter
 * Applied to /verify-email, /resend-otp, /forgot-password, /reset-password (5 requests / 15 minutes per IP)
 */
export const otpRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    prefix: "otp",
    message: "Too many verification or password reset attempts. Please try again later.",
});

/**
 * 5. Password Change Rate Limiter
 * Applied to POST /api/v1/users/change-password (5 requests / 15 minutes per IP)
 */
export const passwordChangeRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    prefix: "pw-change",
    message: "Too many password change requests. Please try again later.",
});

/**
 * 6. Token Refresh Rate Limiter
 * Applied to POST /api/v1/auth/refresh (30 requests / 15 minutes per IP)
 */
export const tokenRefreshRateLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    prefix: "refresh",
    message: "Too many token refresh requests. Please try again later.",
});
