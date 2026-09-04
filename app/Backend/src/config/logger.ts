import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * HOW PRODUCTION LOGS WORK:
 * -----------------------------------------------------------------
 * Pino automatically includes these fields on EVERY log entry —
 * you don't need to define them. They come from pino's core engine:
 *
 *   level    → numeric severity  (pino built-in)
 *   time     → epoch ms          (pino built-in via Date.now())
 *   pid      → process.pid       (Node.js built-in)
 *   hostname → os.hostname()     (Node.js built-in)
 *   msg      → your log message  (your call)
 *   + any extra fields you pass in the first argument
 *
 * Example:
 *   logger.info({ userId: '123' }, 'User logged in')
 *   → {"level":30,"time":1724345842123,"pid":4521,"hostname":"server-01","userId":"123","msg":"User logged in"}
 *
 *   logger.error({ err: new Error('Oops') }, 'DB failed')
 *   → {"level":50,"time":1724345842456,"pid":4521,"hostname":"server-01","err":{"type":"Error","message":"Oops","stack":"..."},"msg":"DB failed"}
 *
 * Pino level → numeric mapping:
 *   trace=10  debug=20  info=30  warn=40  error=50  fatal=60
 * -----------------------------------------------------------------
 */
export const logger = pino({
    level: isDevelopment ? 'debug' : 'info',

    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined, 
});





export default logger;