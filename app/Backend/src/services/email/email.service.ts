import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import type { SendEmailOptions } from "./email.types.js";
import { buildOtpEmail, buildPasswordResetEmail } from "./email.templates.js";

const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: Number(env.EMAIL_PORT) === 465,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
    }
});

transporter.verify().then(() => {
    console.log("Email server is ready");
});

class EmailService {
    async sendOtpEmail(
        toOrOptions: string | { to: string; otp: string },
        otpParam?: string
    ): Promise<void> {
        const to = typeof toOrOptions === "string" ? toOrOptions : toOrOptions.to;
        const otp = typeof toOrOptions === "string" ? otpParam! : toOrOptions.otp;

        await this.send({
            to,
            subject: "Your Verification Code",
            html: buildOtpEmail(otp)
        });
    }

    async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
        await this.send({
            to,
            subject: "Reset Your Password",
            html: buildPasswordResetEmail(resetUrl)
        });
    }

    async send(
        options: SendEmailOptions,
    ): Promise<void> {
        await transporter.sendMail({
            from: env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html
        });
    }
}

export const emailService = new EmailService();
export default emailService;