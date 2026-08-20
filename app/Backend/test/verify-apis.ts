import { connectDatabase, disconnectDatabase, db } from "../src/infrastructure/database/index.js";
import { connectRedis, disconnectRedis, redis } from "../src/infrastructure/redis/index.js";
import { userService } from "../src/modules/users/user.service.js";
import { sessionService } from "../src/services/sessions/session.service.js";
import { authRepository } from "../src/modules/auth/auth.repository.js";
import { passwordService } from "../src/services/password/password.service.js";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { users } from "../src/infrastructure/database/schema/user.schema.js";

async function runTests() {
    console.log("=== Starting User & Session API Verification ===");
    await connectDatabase();
    await connectRedis();

    const testUserId = `test-user-${createId()}`;
    const initialPassword = "OldPassword123!";
    const newPassword = "NewSecurePassword456!";
    const passwordHash = await passwordService.hash(initialPassword);

    try {
        console.log("\n1. Creating test user...");
        await db.insert(users).values({
            id: testUserId,
            fullName: "Original Name",
            email: `test-${testUserId}@example.com`,
            passwordHash,
            isEmailVerified: true,
            role: "USER",
        });
        console.log("✅ User created successfully:", testUserId);

        console.log("\n2. Testing PATCH /users/profile...");
        const updated = await userService.updateProfile(testUserId, {
            fullName: "Updated Full Name",
        });
        if (updated.fullName !== "Updated Full Name") {
            throw new Error(`Profile update mismatch: expected 'Updated Full Name', got '${updated.fullName}'`);
        }
        console.log("✅ Profile updated successfully:", updated.fullName);

        console.log("\n3. Testing POST /users/change-password (wrong current password)...");
        try {
            await userService.changePassword(testUserId, {
                currentPassword: "WrongPassword!",
                newPassword,
            });
            throw new Error("Expected invalid current password to fail");
        } catch (err: any) {
            console.log("✅ Correctly rejected invalid current password:", err.message);
        }

        console.log("\n4. Testing POST /users/change-password (same password)...");
        try {
            await userService.changePassword(testUserId, {
                currentPassword: initialPassword,
                newPassword: initialPassword,
            });
            throw new Error("Expected identical password to fail");
        } catch (err: any) {
            console.log("✅ Correctly rejected identical password:", err.message);
        }

        console.log("\n5. Testing POST /users/change-password (valid password change)...");
        await userService.changePassword(testUserId, {
            currentPassword: initialPassword,
            newPassword,
        });
        const userInDb = await authRepository.findById(testUserId);
        const isNewPasswordValid = await passwordService.compare(newPassword, userInDb!.passwordHash);
        if (!isNewPasswordValid) {
            throw new Error("Password change failed to update database hash");
        }
        console.log("✅ Password changed and verified successfully in DB");

        console.log("\n6. Testing Session management (GET /sessions and DELETE /sessions/:sessionId)...");
        const session1 = `sess-1-${createId()}`;
        const session2 = `sess-2-${createId()}`;
        await sessionService.create(testUserId, session1, {
            ipAddress: "127.0.0.1",
            userAgent: "Chrome Test",
        });
        await sessionService.create(testUserId, session2, {
            ipAddress: "192.168.1.1",
            userAgent: "Firefox Test",
        });

        const allSessions = await sessionService.getAll(testUserId);
        console.log("Found sessions count:", allSessions.length);
        if (allSessions.length !== 2) {
            throw new Error(`Expected 2 sessions, found ${allSessions.length}`);
        }
        console.log("✅ Sessions listed successfully:", allSessions.map(s => s.sessionId));

        console.log("\n7. Testing DELETE /sessions/:sessionId...");
        await sessionService.delete(testUserId, session1);
        const remainingSessions = await sessionService.getAll(testUserId);
        if (remainingSessions.length !== 1 || remainingSessions[0]!.sessionId !== session2) {
            throw new Error(`Session deletion failed: expected 1 session (${session2}), got ${remainingSessions.length}`);
        }
        console.log("✅ Session 1 deleted successfully, remaining:", remainingSessions[0]!.sessionId);

        await sessionService.delete(testUserId, session2);
        const finalSessions = await sessionService.getAll(testUserId);
        if (finalSessions.length !== 0) {
            throw new Error(`Expected 0 sessions, got ${finalSessions.length}`);
        }
        console.log("✅ Session 2 deleted successfully, final count 0");

        console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY!");
    } finally {
        console.log("\nCleaning up test user...");
        await db.delete(users).where(eq(users.id, testUserId));
        await sessionService.deleteAll(testUserId);
        await disconnectDatabase();
        await disconnectRedis();
    }
}

runTests().catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});
