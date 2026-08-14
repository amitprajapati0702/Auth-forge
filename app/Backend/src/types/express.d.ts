import 'express';
import type { AccessTokenPayload } from '../services/token/token.types.js';

declare global {
    namespace Express {
        interface Request {
            requestId: string;
            validatedBody?: unknown;
            user?: AccessTokenPayload;
        }
    }
}

export {};