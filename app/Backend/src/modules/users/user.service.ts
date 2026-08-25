import { authRepository } from "../auth/auth.repository.js";
import passwordService from "../../services/password/password.service.js";
import sessionService from "../../services/sessions/session.service.js";
import auditService from "../../services/audit/audit.service.js";
import ApiError from "../../utils/ApiError.js";
import httpStatus from "../../utils/http-status.js";
import { ErrorCodes } from "../../utils/error-codes.js";
import type { 
    UpdateProfileInput, 
    ChangePasswordInput, 
    GetUsersQueryInput, 
    UpdateRoleInput, 
    UpdateStatusInput 
} from "./user.validation.js";

export interface ActorContext {
    userId: string;
    email: string;
    ipAddress?: string;
}

class UserService {
    async updateProfile(userId: string, data: UpdateProfileInput) {
        const existingUser = await authRepository.findById(userId);
        if (!existingUser) {
            throw new ApiError({
                statuscode: httpStatus.NOT_FOUND,
                message: "User not found",
                errorcode: ErrorCodes.USER_NOT_FOUND,
            });
        }

        const updatedUser = await authRepository.updateProfile(userId, {
            fullName: data.fullName,
        });

        if (!updatedUser) {
            throw new ApiError({
                statuscode: httpStatus.INTERNAL_SERVER_ERROR,
                message: "Failed to update profile",
                errorcode: ErrorCodes.INTERNAL_SERVER_ERROR,
            });
        }

        return {
            id: updatedUser.id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            isEmailVerified: updatedUser.isEmailVerified,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
    }

    async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
        const user = await authRepository.findById(userId);
        if (!user) {
            throw new ApiError({
                statuscode: httpStatus.NOT_FOUND,
                message: "User not found",
                errorcode: ErrorCodes.USER_NOT_FOUND,
            });
        }

        const isCurrentPasswordValid = await passwordService.compare(
            data.currentPassword,
            user.passwordHash
        );


        if (!isCurrentPasswordValid) {
            throw new ApiError({
                statuscode: httpStatus.UNAUTHORIZED,
                message: "Current password is incorrect",
                errorcode: ErrorCodes.INVALID_CREDENTIALS,
            });
        }

        if (data.currentPassword === data.newPassword) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "New password must be different from current password",
                errorcode: ErrorCodes.VALIDATION_ERROR,
            });
        }

        const newPasswordHash = await passwordService.hash(data.newPassword);
        await authRepository.updatePassword(userId, newPasswordHash);
    }

    async getUsers(query: GetUsersQueryInput) {
        return authRepository.findUsers({
            search: query.search,
            role: query.role,
            status: query.status,
            page: query.page,
            limit: query.limit,
        });
    }

    async getUserById(id: string) {
        const user = await authRepository.findById(id);
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
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }

    async updateRole(actor: ActorContext, targetUserId: string, data: UpdateRoleInput) {
        const user = await authRepository.findById(targetUserId);
        if (!user) {
            throw new ApiError({
                statuscode: httpStatus.NOT_FOUND,
                message: "User not found",
                errorcode: ErrorCodes.USER_NOT_FOUND,
            });
        }

        if (actor.userId === targetUserId && data.role !== "ADMIN") {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "You cannot remove your own administrator privileges",
                errorcode: ErrorCodes.VALIDATION_ERROR,
            });
        }

        const previousRole = user.role;
        const updatedUser = await authRepository.updateRole(targetUserId, data.role);

        await auditService.log({
            actorId: actor.userId,
            actorEmail: actor.email,
            action: "USER_ROLE_CHANGED",
            targetUserId: user.id,
            targetUserEmail: user.email,
            ipAddress: actor.ipAddress,
            details: {
                previousRole,
                newRole: data.role,
            },
        });

        return updatedUser;
    }

    async updateStatus(actor: ActorContext, targetUserId: string, data: UpdateStatusInput) {
        const user = await authRepository.findById(targetUserId);
        if (!user) {
            throw new ApiError({
                statuscode: httpStatus.NOT_FOUND,
                message: "User not found",
                errorcode: ErrorCodes.USER_NOT_FOUND,
            });
        }

        if (actor.userId === targetUserId && data.status === "SUSPENDED") {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "You cannot suspend your own account",
                errorcode: ErrorCodes.VALIDATION_ERROR,
            });
        }

        const previousStatus = user.status;
        const updatedUser = await authRepository.updateStatus(targetUserId, data.status);

        // If suspended, terminate all user active sessions immediately
        if (data.status === "SUSPENDED") {
            await sessionService.deleteAll(targetUserId);
        }

        await auditService.log({
            actorId: actor.userId,
            actorEmail: actor.email,
            action: "USER_STATUS_CHANGED",
            targetUserId: user.id,
            targetUserEmail: user.email,
            ipAddress: actor.ipAddress,
            details: {
                previousStatus,
                newStatus: data.status,
                sessionsRevoked: data.status === "SUSPENDED",
            },
        });

        return updatedUser;
    }

    async deleteUser(actor: ActorContext, targetUserId: string) {
        const user = await authRepository.findById(targetUserId);
        if (!user) {
            throw new ApiError({
                statuscode: httpStatus.NOT_FOUND,
                message: "User not found",
                errorcode: ErrorCodes.USER_NOT_FOUND,
            });
        }

        if (actor.userId === targetUserId) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "You cannot delete your own account via this endpoint",
                errorcode: ErrorCodes.VALIDATION_ERROR,
            });
        }

        // Revoke active sessions
        await sessionService.deleteAll(targetUserId);

        await authRepository.deleteUser(targetUserId);

        await auditService.log({
            actorId: actor.userId,
            actorEmail: actor.email,
            action: "USER_DELETED",
            targetUserId: user.id,
            targetUserEmail: user.email,
            ipAddress: actor.ipAddress,
            details: {
                deletedUserEmail: user.email,
                deletedUserName: user.fullName,
            },
        });
    }

    async getAuditLogs(limit = 50) {
        return auditService.getRecentLogs(limit);
    }
}

export const userService = new UserService();
export default userService;
