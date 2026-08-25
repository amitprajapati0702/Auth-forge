import { Worker } from "bullmq";
import { redisConnection } from "../infrastructure/queue/index.js";
import { emailService } from "../services/email/email.service.js";
import type { EmailJob } from "../infrastructure/queue/email.queue.js";
import logger from "../config/logger.js";

export function startEmailWorker(): Worker<EmailJob> {
    const worker = new Worker<EmailJob>(
        "emails",
        async (job) => {
            const { type, to, otp, resetUrl } = job.data;

            logger.info({ jobId: job.id, type, to }, "[EmailWorker] Processing email job");

            switch (type) {
                case "otp":
                    if (!otp) throw new Error("Missing OTP in job data");
                    await emailService.send({
                        to,
                        subject: "Your Verification Code",
                        html: emailService.buildOtpHtml(otp),
                    });
                    break;

                case "password-reset":
                    if (!resetUrl) throw new Error("Missing resetUrl in job data");
                    await emailService.send({
                        to,
                        subject: "Reset Your Password",
                        html: emailService.buildPasswordResetHtml(resetUrl),
                    });
                    break;

                case "welcome":
                    await emailService.send({
                        to,
                        subject: "Welcome to Auth-Forge!",
                        html: emailService.buildWelcomeHtml(to),
                    });
                    break;

                default:
                    throw new Error(`Unknown email job type: ${type}`);
            }

            logger.info({ jobId: job.id, type, to }, "[EmailWorker] Email sent successfully");
        },
        {
            connection: redisConnection,
            concurrency: 5, // process up to 5 emails simultaneously
        }
    );

    worker.on("failed", (job, err) => {
        logger.error(
            { jobId: job?.id, type: job?.data?.type, to: job?.data?.to, err },
            "[EmailWorker] Email job failed"
        );
    });

    worker.on("error", (err) => {
        logger.error({ err }, "[EmailWorker] Worker error");
    });

    logger.info("📧 Email worker started.");
    return worker;
}
