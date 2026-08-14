import { eq } from "drizzle-orm";
import { db } from "../../infrastructure/database/client.js";
import { users } from "../../infrastructure/database/schema/user.schema.js";

import type {
    CreateUserData,
} from "./auth.repository.types.js";


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

    async createUser(
        data: CreateUserData,
    ) {
        const [user] = await db
            .insert(users)
            .values(data)
            .returning();

        return user;
    }


    async markEmailVerified(
        userId: string,
    ) {
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

    async updatePassword(userId: string,passwordHash: string,){

        await db.update(users).set({passwordHash}).where(eq(users.id,userId));
    }

}


export const authRepository = new AuthRepository()
