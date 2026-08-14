import rateLimit from "express-rate-limit";

export const authRateLimit =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 10,

    message:
      "Too many login attempts",
  });