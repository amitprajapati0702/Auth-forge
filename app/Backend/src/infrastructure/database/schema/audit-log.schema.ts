import { pgTable, varchar, timestamp, text } from "drizzle-orm/pg-core";

export const auditLogs = pgTable("audit_logs", {
    id: varchar("id", { length: 64 }).primaryKey(),
    actorId: varchar("actor_id", { length: 64 }).notNull(),
    actorEmail: varchar("actor_email", { length: 320 }).notNull(),
    action: varchar("action", { length: 64 }).notNull(),
    targetUserId: varchar("target_user_id", { length: 64 }),
    targetUserEmail: varchar("target_user_email", { length: 320 }),
    ipAddress: varchar("ip_address", { length: 64 }),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
