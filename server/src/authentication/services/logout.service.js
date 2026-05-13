import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import RefreshToken from "../models/refresh-token.model.js";
import jwtConfig from "../../config/jwt.config.js";

/**
 * Logout Service
 * @param {string} token - Raw refresh token from cookie
 * @param {string} userAgent - Current user-agent
 * @returns {Object} - Success response
 */
export const logoutService = async (token, userAgent) => {
    // 1. Idempotent: If no token, just return success
    if (!token) {
        return {
            statusCode: 200,
            success: true,
            message: "Logged out successfully",
        };
    }

    try {
        // 2. Verify JWT to extract userId
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.refresh.secret);
        } catch (err) {
            return {
                statusCode: 200,
                success: true,
                message: "Logged out successfully",
            };
        }

        const userId = decoded.sub;

        // 3. Revoke all sessions for this user on this user-agent
        // This handles multi-tab logout and ensures any session on this device is invalidated
        await RefreshToken.updateMany(
            {
                userId,
                userAgent,
                isRevoked: false,
            },
            {
                isRevoked: true,
            },
        );

        return {
            statusCode: 200,
            success: true,
            message: "Logged out successfully",
        };
    } catch (error) {
        return {
            statusCode: 200,
            success: true,
            message: "Logged out successfully",
        };
    }
};

export default logoutService;
