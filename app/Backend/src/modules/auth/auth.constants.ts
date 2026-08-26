export const AUTH_CONSTANTS = {
  FULL_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },

  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    BCRYPT_ROUNDS: 12,
  },

  REDIS_KEYS: {
    PENDING_USER: "pending:user",
  },

  OTP: {
    LENGTH: 6,
    EXPIRES_IN_SECONDS: 300,
    RESEND_COOLDOWN_SECONDS: 60,
    MAX_ATTEMPTS: 5,
  },
  SESSION: {
    EXPIRES_IN_SECONDS: 7 * 24 * 60 * 60, 
  },

  ACCESS_TOKEN_EXPIRES_IN: "15m",

  REFRESH_TOKEN_EXPIRES_IN: "7d",

  COOKIES: {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
  },

  LOGIN_SECURITY: {
    MAX_ATTEMPTS: 5,

    LOCK_DURATION_SECONDS:
      15 * 60,
  },

  PASSWORD_RESET: {
    TOKEN_TTL_SECONDS:
      15 * 60,
  },


} as const;