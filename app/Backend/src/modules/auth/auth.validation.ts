import { z } from "zod";

import { AUTH_CONSTANTS } from "./auth.constants.js";
import { emailSchema, passwordSchema } from "../../utils/validators.js";

export const registerSchema = z.object({
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

    email: emailSchema,

    password: z
        .string()
        .min(
            AUTH_CONSTANTS.PASSWORD.MIN_LENGTH,
            "Password must be at least 8 characters.",
        )
        .max(
            AUTH_CONSTANTS.PASSWORD.MAX_LENGTH,
            "Password is too long.",
        ),
});

export const verifyOtpSchema = z.object({
    email: emailSchema,

    otp: z
        .string()
        .length(AUTH_CONSTANTS.OTP.LENGTH, "OTP must be exactly 6 digits.")
        .regex(/^\d+$/, "OTP must contain only digits."),
});

export const loginSchema = z.object({
    email: emailSchema,

    password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const VerifyEmailSchema = z.object({
    email: emailSchema,
    otp: z.string().length(6, "OTP Must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers."),
});

export const resendOtpSchema = z.object({
    email: emailSchema,
});

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required."),
    newPassword: passwordSchema,
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;