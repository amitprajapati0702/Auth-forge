import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { AccessTokenPayload, RefereshTokenPayload } from "./token.types.js";

async function generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    });
}

async function generateRefreshToken(payload: RefereshTokenPayload): Promise<string> {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    });
}

async function verifyAccessToken(
    token: string,
): Promise<AccessTokenPayload> {
    return jwt.verify(
        token,
        env.JWT_ACCESS_SECRET,
    ) as AccessTokenPayload;
}

async function verifyRefreshToken(
    token: string,
): Promise<RefereshTokenPayload> {
    return jwt.verify(
        token,
        env.JWT_REFRESH_SECRET,
    ) as RefereshTokenPayload;
}

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
