import type { Request, Response, NextFunction, RequestHandler } from "express";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "../utils/http-status.js";
import { ErrorCodes } from "../utils/error-codes.js";
import { AUTH_CONSTANTS } from "../modules/auth/auth.constants.js";
import tokenService from "../services/token/token.service.js";

export const authenticate: RequestHandler = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        const token =
            req.cookies?.[AUTH_CONSTANTS.COOKIES.ACCESS_TOKEN] ||
            req.headers.authorization?.replace(/^Bearer\s+/i, "");

        if (!token) {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Authentication token missing",
                errorcode: ErrorCodes.TOKEN_ERROR,
            });
        }

        try {
            const payload = await tokenService.verifyAccessToken(token);

            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
                sessionId: payload.sessionId,
            };

            next();
        } catch (error) {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Invalid or expired authentication token",
                errorcode: ErrorCodes.TOKEN_ERROR,
            });
        }
    }
);

export default authenticate;
