import { createId } from "@paralleldrive/cuid2";
import { db } from "../../infrastructure/database/client.js";
import { auditLogs } from "../../infrastructure/database/schema/audit-log.schema.js";
import logger from "../../config/logger.js";
import { desc } from "drizzle-orm";

export interface LogAuditParams {
    actorId: string;
    actorEmail: string;
    action: string;
    targetUserId?: string;
    targetUserEmail?: string;
    ipAddress?: string;
    details?: string | Record<string, unknown>;
}

class AuditService {
    async log(params: LogAuditParams): Promise<void> {
        const detailsString = typeof params.details === "object" 
            ? JSON.stringify(params.details) 
            : params.details;

        logger.info(
            {
                audit: true,
                actorId: params.actorId,
                actorEmail: params.actorEmail,
                action: params.action,
                targetUserId: params.targetUserId,
                targetUserEmail: params.targetUserEmail,
                ip: params.ipAddress,
                details: params.details,
            },
            `[AUDIT] ${params.action} by ${params.actorEmail}`
        );

        try {
            await db.insert(auditLogs).values({
                id: createId(),
                actorId: params.actorId,
                actorEmail: params.actorEmail,
                action: params.action,
                targetUserId: params.targetUserId,
                targetUserEmail: params.targetUserEmail,
                ipAddress: params.ipAddress,
                details: detailsString,
                createdAt: new Date(),
            });
        } catch (error) {
            logger.error(error, "Failed to write audit log to database");
        }
    }

    async getRecentLogs(limit = 50) {
        try {
            return await db
                .select()
                .from(auditLogs)
                .orderBy(desc(auditLogs.createdAt))
                .limit(limit);
        } catch (error) {
            logger.error(error, "Failed to fetch audit logs");
            return [];
        }
    }
}

export const auditService = new AuditService();
export default auditService;
