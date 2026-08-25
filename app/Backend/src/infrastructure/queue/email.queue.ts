import { createQueue } from "./index.js";

export interface EmailJob {
    type: "otp" | "password-reset" | "welcome";
    to: string;
    // For OTP emails
    otp?: string;
    // For password-reset emails
    resetUrl?: string;
}

// All email sending goes through this queue — async, retried on failure
export const emailQueue = createQueue<EmailJob>("emails");
