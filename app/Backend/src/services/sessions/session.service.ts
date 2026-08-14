import { redis } from "../../infrastructure/redis/index.js";
import { AUTH_CONSTANTS } from "../../modules/auth/auth.constants.js";
import type { SessionData } from "./session.types.js";

class SessionService {
    private getkey(userId: string, sessionId: string): string {
        return `session:${userId}:${sessionId}`;
    }

    async create(
        userId: string,
        sessionId: string,
        data: Omit<SessionData, "userId" | "sessionId"> & Partial<Pick<SessionData, "sessionId">>
    ): Promise<void> {
        const key = this.getkey(userId, sessionId);
        const now = new Date().toISOString();

        const session: SessionData = {
            userId,
            sessionId,
            createdAt: data.createdAt || now,
            lastActivityAt: data.lastActivityAt || now,
            userAgent: data.userAgent,
            ipAddress: data.ipAddress,
        };

        await redis.sAdd(`sessions:${userId}`, sessionId);

        await redis.set(key, JSON.stringify(session), {
            EX: AUTH_CONSTANTS.SESSION.EXPIRES_IN_SECONDS,
        });
    }

    async get(userId: string, sessionId: string): Promise<SessionData | null> {
        const key = this.getkey(userId, sessionId);
        const raw = await redis.get(key);

        if (!raw) {
            return null;
        }

        return JSON.parse(raw) as SessionData;
    }

    async delete(userId: string, sessionId: string): Promise<void> {
        const key = this.getkey(userId, sessionId);
        await redis.sRem(`sessions:${userId}`, sessionId);
        await redis.del(key);
    }

    async deleteAll(userId: string): Promise<void> {
        const sessionIds = await redis.sMembers(`sessions:${userId}`);

        for (const sessionId of sessionIds) {
            await redis.del(this.getkey(userId, sessionId));
        }

        await redis.del(`sessions:${userId}`);
    }
}

export const sessionService = new SessionService();
export default sessionService;