import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import router from "./routes/index.js";
import healthRouter from "./modules/health/health.route.js";
import helmet from "helmet";
import { env } from "./config/env.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import notFoundMiddleware from "./middlewares/not-found.middleware.js";
import requestIdMiddleware from "./middlewares/request-id.middleware.js";
import requestLoggerMiddleware from "./middlewares/request-logger.middleware.js";
import type { Application } from "express";
import { globalRateLimit } from "./middlewares/rate-limit.middleware.js";

const app: Application = express();

// Trust reverse proxy (Cloudflare, Nginx, AWS ALB, Docker) for accurate client IP detection
app.set("trust proxy", 1);

// Middleware (Security & Parsing)
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request identification & logger (Runs before rate limiters to capture all traffic & 429 errors)
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Unthrottled Health Check Route (For Kubernetes / Load Balancer probes)
app.use("/api/v1/health", healthRouter);

// Global Rate Limiter (Protects all remaining endpoints)
app.use(globalRateLimit);

// API Base Check
app.get("/api/v1", (_req, res) => {
    res.json({
        success: true,
        message: "AuthForge Api is running",
    });
});

// API Routes
app.use("/api/v1", router);

// Error Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
