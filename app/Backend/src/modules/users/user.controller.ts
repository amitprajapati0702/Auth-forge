import type { Request, Response, RequestHandler } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import userService from "./user.service.js";
import { 
    getUsersQuerySchema,
    type UpdateProfileInput, 
    type ChangePasswordInput,
    type UpdateRoleInput,
    type UpdateStatusInput
} from "./user.validation.js";
import ApiError from "../../utils/ApiError.js";
import httpStatus from "../../utils/http-status.js";
import { ErrorCodes } from "../../utils/error-codes.js";

export const updateProfile: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await userService.updateProfile(
            req.user!.userId,
            req.validatedBody as UpdateProfileInput
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    }
);

export const changePassword: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        await userService.changePassword(
            req.user!.userId,
            req.validatedBody as ChangePasswordInput
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }
);

export const getUsers: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const parseResult = getUsersQuerySchema.safeParse(req.query);
        if (!parseResult.success) {
            throw new ApiError({
                statuscode: httpStatus.BAD_REQUEST,
                message: "Invalid query parameters",
                errorcode: ErrorCodes.VALIDATION_ERROR,
                details: parseResult.error.flatten(),
            });
        }

        const result = await userService.getUsers(parseResult.data);

        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result,
        });
    }
);

export const getUserById: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const currentUserId = req.user!.userId;
        const userRole = req.user!.role;

        if (userRole !== "ADMIN" && currentUserId !== id) {
            throw new ApiError({
                statuscode: httpStatus.FORBIDDEN,
                message: "Insufficient permissions to view this user profile",
                errorcode: ErrorCodes.AUTHORIZATION_ERROR,
            });
        }

        const user = await userService.getUserById(id as string);

        return res.status(200).json({
            success: true,
            data: user,
        });
    }
);

export const updateUserRole: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const updatedUser = await userService.updateRole(
            {
                userId: req.user!.userId,
                email: req.user!.email,
                ipAddress: req.ip,
            },
            id as string,
            req.validatedBody as UpdateRoleInput
        );

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: updatedUser,
        });
    }
);

export const updateUserStatus: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const updatedUser = await userService.updateStatus(
            {
                userId: req.user!.userId,
                email: req.user!.email,
                ipAddress: req.ip,
            },
            id as string,
            req.validatedBody as UpdateStatusInput
        );

        return res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: updatedUser,
        });
    }
);

export const deleteUser: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        await userService.deleteUser(
            {
                userId: req.user!.userId,
                email: req.user!.email,
                ipAddress: req.ip,
            },
            id as string
        );

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    }
);

export const getAuditLogs: RequestHandler = asyncHandler(
    async (_req: Request, res: Response) => {
        const logs = await userService.getAuditLogs(50);

        return res.status(200).json({
            success: true,
            message: "Audit logs retrieved successfully",
            data: logs,
        });
    }
);
