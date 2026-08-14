import type { Request, Response, RequestHandler } from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import authService from "./auth.service.js";
import type { ForgotPasswordInput, ResetPasswordInput, VerifyEmailInput } from "./auth.validation.js";
import ApiError from "../../utils/ApiError.js";
import httpStatus from "../../utils/http-status.js";
import { ErrorCodes } from "../../utils/error-codes.js";
import { AUTH_CONSTANTS } from "./auth.constants.js";
import tokenService from "../../services/token/token.service.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

const accessTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
};

const refreshTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    await authService.register(req.validatedBody as any);

    return res.status(200).json({ success: true, message: "Verification code sent" });
});

export const verifyEmail: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        await authService.verifyEmail(
            req.validatedBody as VerifyEmailInput,
        );

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
        });
    }
);

export const resendOtp: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { email } = req.validatedBody as { email: string };
        await authService.resendOtp(email);

        return res.status(200).json({
            success: true,
            message: "Verification code sent to your email.",
        });
    }
);

export const login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.validatedBody as any, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
    });

    res.cookie(AUTH_CONSTANTS.COOKIES.ACCESS_TOKEN, result.accessToken, accessTokenCookieOptions);
    res.cookie(AUTH_CONSTANTS.COOKIES.REFRESH_TOKEN, result.refreshToken, refreshTokenCookieOptions);

    return res.status(200).json({
        success: true,
        message: "Login successful",
        user: result.user,
    });
});

export const refresh: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies[AUTH_CONSTANTS.COOKIES.REFRESH_TOKEN] || req.cookies.refreshToken;

    if (!refreshToken) {
        throw new ApiError({
            statuscode: httpStatus.UNAUTHORIZED,
            message: "Refresh Token Missing",
            errorcode: ErrorCodes.REFRESH_TOKEN_REQUIRED,
        });
    }

    const result = await authService.refresh(refreshToken, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
    });

    res.cookie(AUTH_CONSTANTS.COOKIES.ACCESS_TOKEN, result.accessToken, accessTokenCookieOptions);
    res.cookie(AUTH_CONSTANTS.COOKIES.REFRESH_TOKEN, result.refreshToken, refreshTokenCookieOptions);

    return res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
    });
});

export const logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies[AUTH_CONSTANTS.COOKIES.REFRESH_TOKEN] || req.cookies.refreshToken;
    const userId = req.user?.userId;

    if (refreshToken) {
        try {
            const payload = await tokenService.verifyRefreshToken(refreshToken);
            const targetUserId = userId || payload.userId;
            if (targetUserId && payload.sessionId) {
                await authService.logout(targetUserId, payload.sessionId);
            }
        } catch {
            // Ignore invalid/expired refreshToken on logout and proceed to clear cookies
        }
    }

    res.clearCookie(AUTH_CONSTANTS.COOKIES.ACCESS_TOKEN);
    res.clearCookie(AUTH_CONSTANTS.COOKIES.REFRESH_TOKEN);

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

export const logoutAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutAll(req.user!.userId);
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

export const forgotPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.validatedBody as ForgotPasswordInput;
    await authService.forgotPassword(email);

    return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
    });
});

export const resetPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.validatedBody as ResetPasswordInput;
    await authService.resetPassword(token, newPassword);

    return res.status(200).json({
        success: true,
        message: "Password reset successful. Please log in with your new password.",
    });
});

export const getCurrentUser: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.email);
    return res.status(200).json({
        success: true,
        data: { ...user },
    });
});
