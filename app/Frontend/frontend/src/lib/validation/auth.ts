import { z } from "zod";

export const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(
            3,
            "Full name must be at least 3 characters"
        )
        .max(
            100,
            "Full name is too long"
        ),

    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(
            8,
            "Password must be at least 8 characters"
        )
        .regex(
            /[A-Z]/,
            "Password must contain an uppercase letter"
        )
        .regex(
            /[a-z]/,
            "Password must contain a lowercase letter"
        )
        .regex(
            /[0-9]/,
            "Password must contain a number"
        ),
});

export type RegisterInput =
    z.infer<
        typeof registerSchema
    >;

export const verifyEmailSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
    otp: z
        .string()
        .length(6, "OTP must be exactly 6 digits")
        .regex(/^\d+$/, "OTP must contain numbers only"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;


export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email address is required")
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

    password: z
        .string()
        .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;


export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;