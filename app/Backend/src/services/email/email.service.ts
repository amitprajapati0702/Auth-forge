import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import type { SendEmailOptions } from "./email.types.js";
import { buildOtpEmail, buildPasswordResetEmail, buildWelcomeEmail } from "./email.templates.js";
import { emailQueue } from "../../infrastructure/queue/email.queue.js";

const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: Number(env.EMAIL_PORT) === 465,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    },
});

class EmailService {
    // ─── Direct send (called by the worker, not directly by auth service) ───

    buildOtpHtml(otp: string): string {
        return buildOtpEmail(otp);
    }

    buildPasswordResetHtml(resetUrl: string): string {
        return buildPasswordResetEmail(resetUrl);
    }

    buildWelcomeHtml(email: string): string {
        return buildWelcomeEmail(email);
    }

    async send(options: SendEmailOptions): Promise<void> {
        await transporter.sendMail({
            from: env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    }

    // ─── Async queue methods (used by auth service) ───────────────────────

    async sendOtpEmail(toOrOptions: string | { to: string; otp: string }, otpParam?: string): Promise<void> {
        const to  = typeof toOrOptions === "string" ? toOrOptions : toOrOptions.to;
        const otp = typeof toOrOptions === "string" ? otpParam!   : toOrOptions.otp;
        // Enqueue — returns instantly, email sent in background with retries
        await emailQueue.add("send-otp", { type: "otp", to, otp });
    }

    async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
        await emailQueue.add("send-password-reset", { type: "password-reset", to, resetUrl });
    }

    async sendWelcomeEmail(to: string): Promise<void> {
        await emailQueue.add("send-welcome", { type: "welcome", to });
    }
}

export const emailService = new EmailService();
export default emailService;