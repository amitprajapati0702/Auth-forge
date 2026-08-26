import { Queue } from "bullmq";
import { env } from "../../config/env.js";

// Parse REDIS_URL into ioredis-compatible connection options
function getRedisConnection() {
    const url = new URL(env.REDIS_URL);
    return {
        host: url.hostname,
        port: Number(url.port) || 6379,
        password: url.password || undefined,
        db: url.pathname ? Number(url.pathname.replace("/", "")) || 0 : 0,
    };
}

export const redisConnection = getRedisConnection();

export function createQueue<T>(name: string): Queue<T> {
    return new Queue<T>(name, {
        connection: redisConnection,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 }, // 5s → 25s → 125s
            removeOnComplete: { count: 50 },  // keep last 50 completed jobs
            removeOnFail: { count: 100 },      // keep last 100 failed jobs
        },
    });
}
