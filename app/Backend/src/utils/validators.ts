import { z } from "zod";

export const emailSchema = z
    .string()
    .min(1, "Email is required.")
    .email("Invalid email address.")
    .transform((value) => value.trim().toLowerCase());

export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must not exceed 128 characters.");