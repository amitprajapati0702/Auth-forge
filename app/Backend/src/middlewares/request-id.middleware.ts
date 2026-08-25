import type { NextFunction, Request, Response } from 'express';
import { createId } from '@paralleldrive/cuid2';
import logger from '../config/logger.js';

/**
 * Request ID Middleware
 * ---------------------------------------------------------------
 * 1. Reads an existing `X-Request-Id` header so upstream services
 *    (API gateways, load balancers, clients) can supply their own
 *    correlation ID — useful for distributed tracing.
 * 2. Falls back to a fresh cuid2 if none is provided.
 * 3. Attaches `req.log` — a Pino **child logger** with `requestId`
 *    baked in as a permanent field.  Any code that calls:
 *
 *        req.log.info('something happened')
 *
 *    will automatically emit `{ ..., requestId: '<id>', msg: '...' }`
 *    without you having to pass the id manually every time.
 * ---------------------------------------------------------------
 */
export function requestIdMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    // Honour a manually supplied header, otherwise generate a fresh id
    const incomingId = req.headers['x-request-id'];
    const requestId =
        typeof incomingId === 'string' && incomingId.trim() !== ''
            ? incomingId.trim()
            : createId();

    // Store on the request object (available everywhere that has `req`)
    req.requestId = requestId;

    // Echo it back in the response so the client can correlate logs
    res.setHeader('X-Request-Id', requestId);

    // Create a child logger with requestId permanently bound.
    // Every req.log.info / req.log.error etc. will include it automatically.
    req.log = logger.child({ requestId });

    next();
}

export default requestIdMiddleware;