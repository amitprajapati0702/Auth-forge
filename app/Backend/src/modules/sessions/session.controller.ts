import type { Request, Response, RequestHandler } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import sessionService from "../../services/sessions/session.service.js";
import ApiError from "../../utils/ApiError.js";
import httpStatus from "../../utils/http-status.js";
import { ErrorCodes } from "../../utils/error-codes.js";
import { AUTH_CONSTANTS } from "../auth/auth.constants.js";

export const getSessions: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const currentSessionId = req.user!.sessionId;

        const rawSessions = await sessionService.getAll(userId);

        const sessions = rawSessions
            .map((session) => ({
                sessionId: session.sessionId,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                createdAt: session.createdAt,
                lastActivityAt: session.lastActivityAt,
                isCurrent: session.sessionId === currentSessionId,
            }))
            .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

        return res.status(200).json({
            success: true,
            message: "Sessions retrieved successfully",
            data: sessions,
        });
    }
);

export const deleteSession: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const currentSessionId = req.user!.sessionId;
        const sessionId = req.params.sessionId as string;

        if (!sessionId) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "Session ID is required",
                errorcode: ErrorCodes.VALIDATION_ERROR,
            });
        }

        const existingSession = await sessionService.get(userId, sessionId);
        if (!existingSession) {
            throw new ApiError({
                statuscode: httpStatus.NOT_FOUND,
                message: "Session not found",
                errorcode: ErrorCodes.INVALID_SESSION,
            });
        }

        await sessionService.delete(userId, sessionId);

        if (sessionId === currentSessionId) {
            res.clearCookie(AUTH_CONSTANTS.COOKIES.ACCESS_TOKEN);
            res.clearCookie(AUTH_CONSTANTS.COOKIES.REFRESH_TOKEN);
        }

        return res.status(200).json({
            success: true,
            message: "Session terminated successfully",
        });
    }
);
