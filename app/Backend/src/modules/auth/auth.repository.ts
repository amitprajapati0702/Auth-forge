import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../infrastructure/database/client.js";
import { users } from "../../infrastructure/database/schema/user.schema.js";

import type {
    CreateUserData,
} from "./auth.repository.types.js";

export interface FindUsersFilters {
    search?: string;
    role?: "USER" | "ADMIN";
    status?: string;
    page: number;
    limit: number;
}

export class AuthRepository {
    async findByEmail(email: string) {
        return db.query.users.findFirst({
            where: eq(users.email, email),
        });
    }

    async findById(id: string) {
        return db.query.users.findFirst({
            where: eq(users.id, id),
        });
    }

    async createUser(data: CreateUserData) {
        const [user] = await db
            .insert(users)
            .values(data)
            .returning();

        return user;
    }

    async markEmailVerified(userId: string) {
        const [user] = await db
            .update(users)
            .set({
                isEmailVerified: true,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return user;
    }

    async updatePassword(userId: string, passwordHash: string) {
        await db
            .update(users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(users.id, userId));
    }

    async updateProfile(userId: string, data: { fullName?: string }) {
        const [user] = await db
            .update(users)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                fullName: users.fullName,
                email: users.email,
                role: users.role,
                status: users.status,
                isEmailVerified: users.isEmailVerified,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        return user;
    }

    async findUsers(filters: FindUsersFilters) {
        const conditions = [];

        if (filters.search) {
            const searchPattern = `%${filters.search}%`;
            conditions.push(
                or(
                    ilike(users.fullName, searchPattern),
                    ilike(users.email, searchPattern)
                )
            );
        }

        if (filters.role) {
            conditions.push(eq(users.role, filters.role));
        }

        if (filters.status) {
            conditions.push(eq(users.status, filters.status));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const totalResult = await db
            .select({ totalCount: count() })
            .from(users)
            .where(whereClause);

        const total = Number(totalResult[0]?.totalCount || 0);
        const offset = (filters.page - 1) * filters.limit;

        const userList = await db
            .select({
                id: users.id,
                fullName: users.fullName,
                email: users.email,
                role: users.role,
                status: users.status,
                isEmailVerified: users.isEmailVerified,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(whereClause)
            .orderBy(desc(users.createdAt))
            .limit(filters.limit)
            .offset(offset);

        return {
            users: userList,
            pagination: {
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit) || 1,
            },
        };
    }

    async updateRole(userId: string, role: "USER" | "ADMIN") {
        const [user] = await db
            .update(users)
            .set({
                role,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                fullName: users.fullName,
                email: users.email,
                role: users.role,
                status: users.status,
                isEmailVerified: users.isEmailVerified,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        return user;
    }

    async updateStatus(userId: string, status: string) {
        const [user] = await db
            .update(users)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                fullName: users.fullName,
                email: users.email,
                role: users.role,
                status: users.status,
                isEmailVerified: users.isEmailVerified,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            });

        return user;
    }

    async deleteUser(userId: string) {
        const [deleted] = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                email: users.email,
            });

        return deleted;
    }
}

export const authRepository = new AuthRepository();
