import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { getSessions, deleteSession } from "./session.controller.js";

const router: Router = Router();

router.get("/", authenticate, getSessions);
router.delete("/:sessionId", authenticate, deleteSession);

export default router;
