import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { AdminGuard } from "../../middlewares/route-guards.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { 
    updateProfile, 
    changePassword, 
    getUsers, 
    getUserById, 
    updateUserRole, 
    updateUserStatus, 
    deleteUser,
    getAuditLogs
} from "./user.controller.js";
import { 
    updateProfileSchema, 
    changePasswordSchema,
    updateRoleSchema,
    updateStatusSchema
} from "./user.validation.js";

const router: Router = Router();

// User self-service routes
router.patch("/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

// Admin-only user management routes
router.get("/", authenticate, AdminGuard, getUsers);
router.get("/audit-logs", authenticate, AdminGuard, getAuditLogs);
router.get("/:id", authenticate, getUserById);
router.patch("/:id/role", authenticate, AdminGuard, validate(updateRoleSchema), updateUserRole);
router.patch("/:id/status", authenticate, AdminGuard, validate(updateStatusSchema), updateUserStatus);
router.delete("/:id", authenticate, AdminGuard, deleteUser);

export default router;
