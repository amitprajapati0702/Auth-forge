import 'express';
import type { Logger } from 'pino';
import type { AccessTokenPayload } from '../services/token/token.types.js';

declare global {
    namespace Express {
        interface Request {
            requestId: string;
            /** Child logger with `requestId` pre-bound — use instead of the global logger */
            log: Logger;
            validatedBody?: unknown;
            user?: AccessTokenPayload;
        }
    }
}

export {};
