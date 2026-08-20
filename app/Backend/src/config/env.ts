import 'dotenv/config';
import { z } from "zod";

const envschema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),
    JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: z.union([z.string(), z.coerce.number()]),
    JWT_ACCESS_EXPIRES_IN: z.union([z.string(), z.coerce.number()]),
    EMAIL_HOST: z.string(),
    EMAIL_PORT: z.coerce.number(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    EMAIL_FROM: z.string(),
    FRONTEND_URL: z.string(),



});

const parsed = envschema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ INVALID ENV VARS:", parsed.error.issues.map(i => i.message));
    console.error(parsed.error.format())
    process.exit(1);
}

export const env = parsed.data
