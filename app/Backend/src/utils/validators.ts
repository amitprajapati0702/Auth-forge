import { z } from "zod";

export const emailSchema = z
  .email("Invalid email address.")
  .transform((value) => value.trim().toLowerCase());


export const passwordSchema = z.string().min(8,"Password must be at least 8 characters long.")