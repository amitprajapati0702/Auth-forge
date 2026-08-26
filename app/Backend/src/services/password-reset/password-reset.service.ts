import { createHash, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";
import { redis } from "../../infrastructure/redis/index.js";
import { authRepository } from "../../modules/auth/auth.repository.js";
import { AUTH_CONSTANTS } from "../../modules/auth/auth.constants.js";
import emailService from "../email/email.service.js";
import passwordService from "../password/password.service.js";
import sessionService from "../sessions/session.service.js";
import ApiError from "../../utils/ApiError.js";
import httpStatus from "../../utils/http-status.js";
import { ErrorCodes } from "../../utils/error-codes.js";

class PasswordResetService {
    private getResetTokenKey(tokenHash: string): string {
        return `password-reset:${tokenHash}`;
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await authRepository.findByEmail(email);

        if (!user) {
            throw new ApiError({
                statuscode: httpStatus.NOT_FOUND,
                message: "User not found.",
                errorcode: ErrorCodes.USER_NOT_FOUND
            });
        }

        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");

        const key = this.getResetTokenKey(tokenHash);
        await redis.set(key, user.id, {
            EX: AUTH_CONSTANTS.PASSWORD_RESET.TOKEN_TTL_SECONDS,
        });

        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

        await emailService.sendPasswordResetEmail(email, resetUrl);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const key = this.getResetTokenKey(tokenHash);

        const userId = await redis.get(key);

        if (!userId) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "Invalid or expired password reset token.",
                errorcode: ErrorCodes.TOKEN_ERROR,
            });
        }

        const passwordHash = await passwordService.hash(newPassword);

        await authRepository.updatePassword(userId, passwordHash);

        await redis.del(key);

        await sessionService.deleteAll(userId);
    }
}

export const passwordResetService = new PasswordResetService();
export default passwordResetService;