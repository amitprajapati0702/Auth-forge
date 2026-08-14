import { Router } from 'express';

import healthRouter from '../modules/health/health.route.js';
import authRouter from '../modules/auth/auth.route.js';

const router: Router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);

export default router;