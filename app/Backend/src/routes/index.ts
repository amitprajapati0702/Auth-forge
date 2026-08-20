import { Router } from 'express';

import healthRouter from '../modules/health/health.route.js';
import authRouter from '../modules/auth/auth.route.js';
import userRouter from '../modules/users/user.route.js';
import sessionRouter from '../modules/sessions/session.route.js';

const router: Router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/sessions', sessionRouter);

export default router;