import type { RequestHandler } from "express";
import { authorize } from "./authorize.middleware.js";

export const AdminGuard: RequestHandler = authorize("ADMIN", "SUPER_ADMIN");
