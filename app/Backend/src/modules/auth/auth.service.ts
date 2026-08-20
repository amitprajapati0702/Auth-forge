import { createHash, randomUUID, randomBytes } from "node:crypto";
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

        // OTP is valid - Create user
        await authRepository.createUser({
            id: createId(),
            email: pending.email,
            passwordHash: pending.passwordHash,
            fullName: pending.fullname,
            isEmailVerified: true,
            
        });

        // Clean up pending registration
        await pendingRegistrationService.delete(pending.email);
    }

    async resendOtp(email: string): Promise<void> {
        const pending = await pendingRegistrationService.find(email);

        if (!pending) {
            const existingUser = await authRepository.findByEmail(email);
            if (existingUser && existingUser.isEmailVerified) {
                throw new ApiError({
                    statuscode: httpStatus.BAD_REQUEST,
                    message: "Email is already verified. Please log in.",
                    errorcode: ErrorCodes.EMAIL_ALREADY_EXISTS,
                });
            }

            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "No pending registration found for this email. Please register again.",
                errorcode: ErrorCodes.OTP_EXPIRED,
            });
        }

        const otp = otpService.generate();
        const otpHash = createHash("sha256").update(otp).digest("hex");

        pending.otpHash = otpHash;
        pending.attempts = 0;
        pending.createdAt = new Date().toISOString();

        await pendingRegistrationService.store(pending);

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
        metadata: { ipAddress?: string; userAgent?: string }
    ) {

        const locked = await loginSecurityService.isLocked(data.email);

        if (locked) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message:
                    "Account temporarily locked",

                errorcode:
                    ErrorCodes.ACCOUNT_LOCKED,
            });
        }
        const user = await authRepository.findByEmail(data.email);

        if (!user) {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Invalid Credentials",
                errorcode: ErrorCodes.INVALID_CREDENTIALS,
            });
        }

        const isValidPassword = await passwordService.compare(
            data.password,
            user.passwordHash
        );

        if (!isValidPassword) {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Invalid Credentials",
                errorcode: ErrorCodes.INVALID_CREDENTIALS,
            });
        }
        await loginSecurityService.clearAttempts(data.email);


        if (user.status === "SUSPENDED") {
            throw new ApiError({
                statuscode: httpStatus.FORBIDDEN,
                message: "Your account has been suspended. Please contact support.",
                errorcode: ErrorCodes.AUTHORIZATION_ERROR,
            });
        }

        if (!user.isEmailVerified) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "Email Not Verified",
                errorcode: ErrorCodes.EMAIL_NOT_VERIFIED,
            });
        }

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
            },
        };
    }

    async refresh(
        refreshToken: string,
        metadata: { ipAddress?: string; userAgent?: string }
    ) {
        const payload = await tokenService.verifyRefreshToken(refreshToken);

        const session = await sessionService.get(
            payload.userId,
            payload.sessionId
        );

        if (!session) {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Invalid Refresh Token",
                errorcode: ErrorCodes.INVALID_SESSION,
            });
        }

        // Delete old session for token rotation
        await sessionService.delete(payload.userId, payload.sessionId);

        const user = await authRepository.findById(payload.userId);

        if (!user) {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "User not found",
                errorcode: ErrorCodes.USER_NOT_FOUND,
            });
        }

        const newSessionId = randomBytes(32).toString("hex");
        const now = new Date().toISOString();
        await sessionService.create(user.id, newSessionId, {
            sessionId: newSessionId,
            createdAt: now,
            lastActivityAt: now,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
        });

        const accessToken = await tokenService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            sessionId: newSessionId,
        });
        const newRefreshToken = await tokenService.generateRefreshToken({
            userId: user.id,
            sessionId: newSessionId,
        });

        return {
            accessToken,
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
            throw new Error('User not found');
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