import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/users.model.js";
import RefreshToken from "../models/refresh-token.model.js";
import { deleteRevokedTokens } from "./refresh-token.service.js";

import AppError from "../../utils/AppError.js";
import generateTokens from "../../utils/generateTokens.js";
import jwtConfig from "../../config/jwt.config.js";

/**
 * Login Service
 * @param {Object} payload - { identifier, password }
 * @param {Object} metadata - { userAgent, ipAddress }
 * @returns {Object} - Success response or throws AppError
 */
export const loginService = async (payload, metadata) => {
    try {
        const { identifier, password } = payload;
        const { userAgent, ipAddress } = metadata;

        // 1. Find User by identifier (email or username)
        // Normalize identifier
        const normalizedIdentifier = identifier.trim().toLowerCase();

        const user = await User.findOne({
            $or: [
                { email: normalizedIdentifier },
                { username: normalizedIdentifier },
            ],
        }).select("+password");

        // 2. User Not Found or Password Incorrect (Generic Message)
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError(401, "Invalid credentials");
        }

        // 3. Verify Account Check
        if (!user.isVerified) {
            return {
                statusCode: 403,
                success: false,
                message: "Please verify your email first",
                requiresVerification: true,
            };
        }

        // 4. Generate Tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // 5. Hash Refresh Token
        const BCRYPT_SALT_ROUNDS = 12;
        const hashedRefreshToken = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);

        // 6. Save Session (Refresh Token)
        const { rememberMe } = payload;

        // Default expiry from config or 7 days
        const refreshExpiresIn = jwtConfig.refresh.expiresIn || "7d";
        let expiryMs = 7 * 24 * 60 * 60 * 1000;

        if (rememberMe) {
            // Overwrite with 30 days if rememberMe is true
            expiryMs = 30 * 24 * 60 * 60 * 1000;
        } else if (typeof refreshExpiresIn === "number") {
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
            hashedToken: hashedRefreshToken,
            userAgent,
            ipAddress,
            expiresAt,
        });

        // 7. Cleanup Revoked Tokens (for this device)
        await deleteRevokedTokens(user._id, userAgent);

        // 8. Safe User Object
        const userObj = user.toObject();
        delete userObj.password;

        // 8. Return Success
        return {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,
                user: userObj,
                rememberMe,
                expiryMs,
            },
        };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(500, error.message || "Login failed");
    }
};

export default loginService;
