import { pinoHttp } from 'pino-http';

import logger from "../config/logger.js";
import {REDACT_PATHS} from "../utils/log-redaction.js"

export const requestLoggerMiddleware = pinoHttp({
  logger: logger as any,

  genReqId: (req: any) => req.requestId,

  customSuccessMessage(req: any, res: any) {
    return `${req.method} ${req.url} completed with ${res.statusCode}`;
  },

  customErrorMessage(req: any, res: any) {
    return `${req.method} ${req.url} failed with ${res.statusCode}`;
  },

  customLogLevel(req: any, res: any, error: any) {
    if (error || res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },

  customProps(req: any) {
    return {
      requestId: req.requestId,
    };
  },

  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
  },
});

export default requestLoggerMiddleware;