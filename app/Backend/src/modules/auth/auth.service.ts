import { createHash, randomBytes } from "node:crypto";
import { createId } from "@paralleldrive/cuid2";

import { authRepository } from "./auth.repository.js";
import passwordService from "../../services/password/password.service.js";
import otpService from "../../services/otp/otp.service.js";
import emailService from "../../services/email/email.service.js";
import pendingRegistrationService from "../../services/pending-registration/pending-registration.service.js";
import sessionService from "../../services/sessions/session.service.js";
import tokenService from "../../services/token/token.service.js";

import type { RegisterInput } from "./auth.types.js";
import type { LoginInput, VerifyEmailInput } from "./auth.validation.js";
import ApiError from "../../utils/ApiError.js";
import httpStatus from "../../utils/http-status.js";
import { ErrorCodes } from "../../utils/error-codes.js";
import { AUTH_CONSTANTS } from "./auth.constants.js";
import loginSecurityService from "../../services/login-security/login-security.service.js";
import passwordResetService from "../../services/password-reset/password-reset.service.js";
import type { CurrentUserDto } from "./dto/create-user.dto.js";

class AuthService {
    async register(data: RegisterInput): Promise<void> {
        // Check if email already exists in users database
        const existingUser = await authRepository.findByEmail(data.email);
        if (existingUser) {
            throw new ApiError({
                statuscode: httpStatus.CONFLICT,
                message: "Email already exists",
                errorcode: ErrorCodes.EMAIL_ALREADY_EXISTS,
            });
        }

        // Hash password
        const passwordHash = await passwordService.hash(data.password);

        // Generate OTP
        const otp = otpService.generate();
        const otpHash = createHash("sha256").update(otp).digest("hex");

        await pendingRegistrationService.store({
            fullname: data.fullName,
            email: data.email,
            passwordHash,
            otpHash,
            attempts: 0,
            createdAt: new Date().toISOString(),
        });

        try {
            await emailService.sendOtpEmail({
                to: data.email,
                otp,
            });
        } catch (error) {
            await pendingRegistrationService.delete(data.email);
            throw new ApiError({
                statuscode: httpStatus.INTERNAL_SERVER_ERROR,
                message: "Failed to send OTP email",
                errorcode: ErrorCodes.INTERNAL_SERVER_ERROR,
            });
        }
    }

    async verifyEmail(data: VerifyEmailInput): Promise<void> {
        const pending = await pendingRegistrationService.find(data.email);

        if (!pending) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "Invalid or expired verification code",
                errorcode: ErrorCodes.OTP_EXPIRED,
            });
        }

        const submitHash = createHash("sha256").update(data.otp).digest("hex");

        if (submitHash !== pending.otpHash) {
            pending.attempts += 1;

            if (pending.attempts >= AUTH_CONSTANTS.OTP.MAX_ATTEMPTS) {
                await pendingRegistrationService.delete(pending.email);
                throw new ApiError({
                    statuscode: httpStatus.BAD_REQUEST,
                    message: "Maximum verification attempts exceeded",
                    errorcode: ErrorCodes.OTP_ATTEMPTS_EXCEEDED,
                });
            }

            await pendingRegistrationService.store(pending);

            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "Invalid verification code",
                errorcode: ErrorCodes.OTP_INVALID,
            });
        }

        await authRepository.createUser({
            id: createId(),
            fullName: pending.fullname,
            email: pending.email,
            passwordHash: pending.passwordHash,
            isEmailVerified: true,
        });

        await pendingRegistrationService.delete(pending.email);

        // Send welcome email via queue
        await emailService.sendWelcomeEmail(pending.email);
    }

    async resendOtp(email: string): Promise<void> {
        const pending = await pendingRegistrationService.find(email);

        if (!pending) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "No pending registration found for this email",
                errorcode: ErrorCodes.OTP_EXPIRED,
            });
        }

        const createdAt = new Date(pending.createdAt).getTime();
        const now = Date.now();
        const elapsed = (now - createdAt) / 1000;

        if (elapsed < AUTH_CONSTANTS.OTP.RESEND_COOLDOWN_SECONDS) {
            const waitTime = Math.ceil(
                AUTH_CONSTANTS.OTP.RESEND_COOLDOWN_SECONDS - elapsed,
            );
            throw new ApiError({
                statuscode: httpStatus.TOO_MANY_REQUESTS,
                message: `Please wait ${waitTime} seconds before requesting a new OTP`,
                errorcode: ErrorCodes.OTP_RESEND_TOO_SOON,
            });
        }

        const otp = otpService.generate();
        const otpHash = createHash("sha256").update(otp).digest("hex");

        await pendingRegistrationService.store({
            ...pending,
            otpHash,
            attempts: 0,
            createdAt: new Date().toISOString(),
        });

        try {
            await emailService.sendOtpEmail({
                to: email,
                otp,
            });
        } catch (error) {
            throw new ApiError({
                statuscode: httpStatus.INTERNAL_SERVER_ERROR,
                message: "Failed to send OTP email",
                errorcode: ErrorCodes.INTERNAL_SERVER_ERROR,
            });
        }
    }

    async login(
        data: LoginInput,
        metadata: { ipAddress?: string; userAgent?: string },
    ) {
        // Step 1: Check account lock BEFORE anything else
        const isLocked = await loginSecurityService.isLocked(data.email);
        if (isLocked) {
            throw new ApiError({
                statuscode: httpStatus.TOO_MANY_REQUESTS,
                message: "Too many failed attempts. Account locked. Try again later.",
                errorcode: ErrorCodes.ACCOUNT_LOCKED,
            });
        }

        // Step 2: Look up user by email
        const user = await authRepository.findByEmail(data.email);
        if (!user) {
            await loginSecurityService.incrementAttempts(data.email);
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Invalid Credentials",
                errorcode: ErrorCodes.INVALID_CREDENTIALS,
            });
        }

        // Step 3: Check account status BEFORE verifying password
        if (user.status === "SUSPENDED") {
            throw new ApiError({
                statuscode: httpStatus.FORBIDDEN,
                message: "Your account has been suspended. Please contact support.",
                errorcode: ErrorCodes.ACCOUNT_SUSPENDED,
            });
        }

        // Step 4: Check email verification BEFORE verifying password
        if (!user.isEmailVerified) {
            throw new ApiError({
                statuscode: httpStatus.FORBIDDEN,
                message: "Please verify your email before logging in.",
                errorcode: ErrorCodes.EMAIL_NOT_VERIFIED,
            });
        }

        // Step 5: Verify password
        const isValidPassword = await passwordService.compare(
            data.password,
            user.passwordHash,
        );
        if (!isValidPassword) {
            await loginSecurityService.incrementAttempts(data.email);
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Invalid Credentials",
                errorcode: ErrorCodes.INVALID_CREDENTIALS,
            });
        }

        // Step 6: Successful login — clear brute-force counter
        await loginSecurityService.clearAttempts(data.email);

        const sessionId = randomBytes(32).toString("hex");
        const now = new Date().toISOString();
        await sessionService.create(user.id, sessionId, {
            sessionId,
            createdAt: now,
            lastActivityAt: now,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
        });

        const accessToken = await tokenService.generateAccessToken({
            userId: user.id,
            email: user.email,
            sessionId,
            role: user.role,
        });
        const refreshToken = await tokenService.generateRefreshToken({
            userId: user.id,
            sessionId,
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        };
    }

    async refresh(
        refreshToken: string,
        metadata: { ipAddress?: string; userAgent?: string },
    ) {
        let payload;
        try {
            payload = await tokenService.verifyRefreshToken(refreshToken);
        } catch {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Invalid Refresh Token",
                errorcode: ErrorCodes.TOKEN_ERROR,
            });
        }

        const session = await sessionService.get(
            payload.userId,
            payload.sessionId,
        );
        if (!session) {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Session Expired",
                errorcode: ErrorCodes.INVALID_SESSION,
            });
        }

        const user = await authRepository.findById(payload.userId);
        if (!user) {
            await sessionService.delete(payload.userId, payload.sessionId);
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "User not found",
                errorcode: ErrorCodes.USER_NOT_FOUND,
            });
        }

        if (user.status === "SUSPENDED") {
            await sessionService.delete(payload.userId, payload.sessionId);
            throw new ApiError({
                statuscode: httpStatus.FORBIDDEN,
                message: "Your account has been suspended.",
                errorcode: ErrorCodes.ACCOUNT_SUSPENDED,
            });
        }

        const newAccessToken = await tokenService.generateAccessToken({
            userId: user.id,
            email: user.email,
            sessionId: payload.sessionId,
            role: user.role,
        });

        const newRefreshToken = await tokenService.generateRefreshToken({
            userId: user.id,
            sessionId: payload.sessionId,
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(userId: string, sessionId: string): Promise<void> {
        await sessionService.delete(userId, sessionId);
    }

    async logoutAll(userId: string): Promise<void> {
        await sessionService.deleteAll(userId);
    }

    async forgotPassword(email: string): Promise<void> {
        await passwordResetService.forgotPassword(email);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await passwordResetService.resetPassword(token, newPassword);
    }

    async getCurrentUser(email: string): Promise<CurrentUserDto> {
        const user = await authRepository.findByEmail(email);

        if (!user) {
            throw new ApiError({
                statuscode: httpStatus.NOT_FOUND,
                message: "User not found",
                errorcode: ErrorCodes.USER_NOT_FOUND,
            });
        }

        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
            isEmailVerified: user.isEmailVerified,
        };
    }
}

export const authService = new AuthService();
export default authService;