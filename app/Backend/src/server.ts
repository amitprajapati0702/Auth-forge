import http from 'http';

import app from "./app.js"

import {env} from "./config/env.js"
import logger from './config/logger.js';
import { connectRedis,disconnectRedis, checkRedisHealth } from './infrastructure/redis/index.js';
import { connectDatabase,disconnectDatabase,checkDatabaseHealth } from './infrastructure/database/index.js';
import { startEmailWorker } from './workers/email.worker.js';
import type { Worker } from 'bullmq';

async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Starting AuthForge...');

    await connectDatabase();

    const databaseHealthy = await checkDatabaseHealth();

    if (!databaseHealthy) {
      throw new Error('Database health check failed.');
    }

    await connectRedis();

    const redisHealthy = await checkRedisHealth();

    if (!redisHealthy) {
      throw new Error('Redis health check failed.');
    }

    // Start background workers
    const emailWorker = startEmailWorker();

    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });

    registerShutdown(server, emailWorker);
  } catch (error) {
    logger.fatal(error, 'Application startup failed.');

    process.exit(1);
  }
}

function registerShutdown(server: http.Server, emailWorker: Worker): void {
  const shutdown = async (signal: string) => {
    logger.warn(`${signal} received. Shutting down...`);

    server.close(async () => {
      try {
        await emailWorker.close();

        await disconnectRedis();

        await disconnectDatabase();

        logger.info('Shutdown complete.');

        process.exit(0);
      } catch (error) {
        logger.fatal(error, 'Shutdown failed.');

        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

process.on('unhandledRejection', (reason) => {
  logger.fatal(reason, 'Unhandled Promise Rejection');

  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.fatal(error, 'Uncaught Exception');

  process.exit(1);
});


bootstrap()
