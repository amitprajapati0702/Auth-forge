import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { redis } from "../infrastructure/redis/index.js";

import ApiError from "../utils/ApiError.js";

import HttpStatus from "../utils/http-status.js";

import { ErrorCodes } from "../utils/error-codes.js";

const LIMIT = 5;

const WINDOW_SECONDS = 900;

export async function
registerRateLimit(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const ip =
      req.ip ?? "unknown";

    const key =
      `rate:register:${ip}`;

    const count =
      await redis.incr(key);

    if (count === 1) {
      await redis.expire(
        key,
        WINDOW_SECONDS,
      );
    }

    if (count > LIMIT) {
      return next(
        new ApiError({
          statuscode:HttpStatus.TOO_MANY_REQUESTS,

          message:
            "Too many registration attempts.",

          errorcode:
            ErrorCodes.INTERNAL_SERVER_ERROR,
        }),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}