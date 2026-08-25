import { Router } from "express";

import {
    loginSchema,
    registerSchema,
    VerifyEmailSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "./auth.validation.js";

import {
    login,
    logout,
    logoutAll,
    refresh,
    register,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
    getCurrentUser,
} from "./auth.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authRateLimit } from "../../middlewares/auth.rate.limit.middleware.js";
import { registerRateLimit } from "../../middlewares/register-rate-limit.middleware.js";

const router: Router = Router();

// Core Auth Routes
router.post("/register", registerRateLimit, validate(registerSchema), register);
router.post("/verify-email", validate(VerifyEmailSchema), verifyEmail);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/login", authRateLimit, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAll);
router.get("/me", authenticate, getCurrentUser);

// Password Routes
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;