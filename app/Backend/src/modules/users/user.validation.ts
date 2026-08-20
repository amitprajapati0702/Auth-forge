import { z } from "zod";
import { AUTH_CONSTANTS } from "../auth/auth.constants.js";
import { passwordSchema } from "../../utils/validators.js";

export const updateProfileSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(
            AUTH_CONSTANTS.FULL_NAME.MIN_LENGTH,
            "Full name is too short.",
        )
        .max(
            AUTH_CONSTANTS.FULL_NAME.MAX_LENGTH,
            "Full name is too long.",
        ),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
});

export const getUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
});

export const updateRoleSchema = z.object({
    role: z.enum(["USER", "ADMIN"]),
});

export const updateStatusSchema = z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type GetUsersQueryInput = z.infer<typeof getUsersQuerySchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
