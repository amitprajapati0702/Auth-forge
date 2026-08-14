import { authorize } from "./authorize.middleware.js";

export const AdminGuard = authorize("ADMIN","SUPER_ADMIN")

export const superADMINGuard = authorize("SUPER_ADMIN")
