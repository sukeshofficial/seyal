import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/users.model.js";
import RefreshToken from "../models/refresh-token.model.js";

import AppError from "../../utils/AppError.js";
import generateTokens from "../../utils/generateTokens.js";
import jwtConfig from "../../config/jwt.config.js";

/**
 * Refresh Token Service
 * @param {string} token - Raw refresh token from cookie
 * @param {Object} metadata - { userAgent, ipAddress }
 * @returns {Object} - Success response with new tokens or throws AppError
 */
export const refreshTokenService = async (token, metadata) => {
    if (!token) {
        throw new AppError(401, "Refresh token is missing");
    }

    try {
        const { userAgent, ipAddress } = metadata;

        // 1. Verify JWT
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.refresh.secret);
        } catch (err) {
            throw new AppError(401, "Invalid or expired refresh token");
        }

        const userId = decoded.sub;

        // 2. Find Active Sessions for this user
        // Since we store hashed tokens, we find all non-revoked sessions for the user
        // and compare each one using bcrypt.
        const activeSessions = await RefreshToken.find({
            userId,
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });

        let currentSession = null;
        for (const session of activeSessions) {
            const isMatch = await bcrypt.compare(token, session.hashedToken);
            if (isMatch) {
                currentSession = session;
                break;
            }
        }

        if (!currentSession) {
            throw new AppError(401, "Session not found or already revoked");
        }

        // 3. Get User
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(404, "User no longer exists");
        }

        // 4. Generate New Tokens (Rotation)
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);

        // 5. Hash New Refresh Token
        const BCRYPT_SALT_ROUNDS = 12;
        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, BCRYPT_SALT_ROUNDS);

        // 6. Revoke Old Session & Create New Session
        // We update the old session to mark it as revoked
        currentSession.isRevoked = true;
        await currentSession.save();

        // Calculate expiry: default to 7 days if not a number
        // (Reusing the manual logic from login.service.js)
        const refreshExpiresIn = jwtConfig.refresh.expiresIn || "7d";
        let expiryMs = 7 * 24 * 60 * 60 * 1000; // Default 7 days

        if (typeof refreshExpiresIn === "number") {
            expiryMs = refreshExpiresIn;
        } else if (typeof refreshExpiresIn === "string") {
            const unit = refreshExpiresIn.slice(-1);
            const value = parseInt(refreshExpiresIn.slice(0, -1));
            if (!isNaN(value)) {
                if (unit === "d") expiryMs = value * 24 * 60 * 60 * 1000;
                else if (unit === "h") expiryMs = value * 60 * 60 * 1000;
                else if (unit === "m") expiryMs = value * 60 * 1000;
                else if (unit === "s") expiryMs = value * 1000;
            }
        }

        const expiresAt = new Date(Date.now() + expiryMs);

        await RefreshToken.create({
            userId: user._id,
            hashedToken: hashedNewRefreshToken,
            userAgent,
            ipAddress,
            expiresAt,
        });

        // 7. Return Success
        return {
            statusCode: 200,
            success: true,
            message: "Session refreshed",
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(500, error.message || "Token refresh failed");
    }
};

export default refreshTokenService;
