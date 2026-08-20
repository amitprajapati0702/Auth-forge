import { pgTable, boolean, timestamp, varchar,pgEnum } from "drizzle-orm/pg-core";


export const roleEnum =pgEnum("role", ["USER","ADMIN"]);
export const UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;


export const users = pgTable("users", {
    id: varchar("id", { length: 64 }).primaryKey(),
    fullName: varchar("full_name", {
        length: 300
    }).notNull(),
    email: varchar("email", {
        length: 320,
    }).notNull().unique(),
    passwordHash: varchar("password_hash", {
        length: 255
    }).notNull(),
    isEmailVerified: boolean("is_email_verified").default(false).notNull(),
    role: roleEnum("role").notNull().default("USER"),
    status:varchar("status",{length:10}).default(UserStatus.ACTIVE).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),



})