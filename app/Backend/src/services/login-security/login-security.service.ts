import { redis } from "../../infrastructure/redis/index.js";
import { AUTH_CONSTANTS } from "../../modules/auth/auth.constants.js";

class LoginSecurityService {
  private getAttemptsKey(email: string): string {
    return `login:attempts:${email}`;
  }

  async incrementAttempts(email: string): Promise<number> {
    const key = this.getAttemptsKey(email);
    const attempts = await redis.incr(key);

    if (attempts === 1) {
      // expire() takes seconds as TTL — expireAt() takes a Unix timestamp (was wrong)
      await redis.expire(key, AUTH_CONSTANTS.LOGIN_SECURITY.LOCK_DURATION_SECONDS);
    }

    return attempts;
  }

  async clearAttempts(email: string): Promise<void> {
    await redis.del(this.getAttemptsKey(email));
  }

  async isLocked(email: string): Promise<boolean> {
    const attempts = Number(
      (await redis.get(this.getAttemptsKey(email))) || 0
    );

    return attempts >= AUTH_CONSTANTS.LOGIN_SECURITY.MAX_ATTEMPTS;
  }
}

export const loginSecurityService = new LoginSecurityService();
export default loginSecurityService;