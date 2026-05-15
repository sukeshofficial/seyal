import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/users.model.js";
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
        // 2. Verify JWT to extract userId (soft check — we log out even if expired)
        let decoded;
        try {
            decoded = jwt.verify(token, jwtConfig.refresh.secret);
        } catch (err) {
            // Expired or invalid refresh token — still return success (idempotent logout)
            return {
                statusCode: 200,
                success: true,
                message: "Logged out successfully",
            };
        }

        const userId = decoded.sub;

        // 3. Revoke all sessions for this user on this user-agent
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

        // 4. Increment tokenVersion — this is the critical step.
        //    Any access tokens issued before this moment will now be rejected
        //    by the protect middleware because their 'tv' claim will be stale.
        await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });

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
