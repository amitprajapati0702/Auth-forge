import { randomInt, createHash } from "crypto";
import { redis } from "../../infrastructure/redis/client.js"
import { AUTH_CONSTANTS } from "../../modules/auth/auth.constants.js";

import type { OtpVerificationResult } from "./otp.type.js";


class OtpService {
    private readonly keyPrefix = 'otp:';

    private getOtpKey(email: string): string {
        return `${this.keyPrefix}${email}`;

    }

    private hashOtp(otp: string): string {
        return createHash('sha256').update(otp).digest('hex')
    }




    generate(): string {
        const min = 10 ** (AUTH_CONSTANTS.OTP.LENGTH - 1)
        const max = 10 ** AUTH_CONSTANTS.OTP.LENGTH;

        return randomInt(min, max).toString();
    }

    async store(email: string, otp: string): Promise<void> {
        const key = this.getOtpKey(email);
        const otpHash = this.hashOtp(otp);

        await redis.hSet(key, {
            hash: otpHash,
            attempts: "0"
        })

        await redis.expire(key, AUTH_CONSTANTS.OTP.EXPIRES_IN_SECONDS);



    }

    async verify(email: string, otp: string): Promise<OtpVerificationResult> {
        const key = this.getOtpKey(email)
        const exists = await redis.exists(key)

        if (!exists) {
            return {
                verified: false,
                attemptsRemaining: 0
            }
        }

        const data = await redis.hGetAll(key)

        const storehash = data.hash;
        const attempts = Number(data.attempts ?? 0)

        const submittedHash = this.hashOtp(otp);

        if (submittedHash === storehash) {
            await redis.del(key);

            return {
                verified: true,
                attemptsRemaining:
                    AUTH_CONSTANTS.OTP.MAX_ATTEMPTS -
                    attempts,
            };
        }

        const currentAttempts = await redis.hIncrBy(
            key,
            "attempts",
            1,
        );

        if (
            currentAttempts >=
            AUTH_CONSTANTS.OTP.MAX_ATTEMPTS
        ) {
            await redis.del(key);

            return {
                verified: false,
                attemptsRemaining: 0,
            };
        }

        return {
            verified: false,
            attemptsRemaining:
                AUTH_CONSTANTS.OTP.MAX_ATTEMPTS -
                currentAttempts,
        };

    }

}


export const otpService = new OtpService()

export default otpService