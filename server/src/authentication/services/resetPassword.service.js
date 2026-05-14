import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/users.model.js";
import OTP from "../models/otp.model.js";
import RefreshToken from "../models/refresh-token.model.js";

import AppError from "../../utils/AppError.js";

const BCRYPT_SALT_ROUNDS = 12;
const OTP_PURPOSE = "forgot-password";

/**
 * Reset Password Service
 * @param {Object} payload - { email, otp, password }
 * @returns {Object} - Success response
 */
export const resetPasswordService = async (payload) => {
    const isProduction = process.env.NODE_ENV === "production";
    const session = isProduction ? await mongoose.startSession() : null;

    try {
        const { email, otp, password } = payload;
        const normalizedEmail = email.trim().toLowerCase();

        if (isProduction) {
            session.startTransaction();
        }

        // 1. Find User
        const user = await User.findOne({ email: normalizedEmail }).session(session);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        // 2. Find and Verify OTP
        const otpRecord = await OTP.findOne({
            userId: user._id,
            purpose: OTP_PURPOSE,
            isUsed: false,
        }).session(session);

        if (!otpRecord) {
            throw new AppError(400, "Reset code not found or expired");
        }

        // Check if expired (handled by TTL index but good to check)
        if (new Date() > otpRecord.expiresAt) {
            throw new AppError(400, "Reset code has expired");
        }

        // Verify Hash
        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            otpRecord.attempts += 1;
            await otpRecord.save({ session });

            if (otpRecord.attempts >= 5) {
                await otpRecord.deleteOne({ session });
                throw new AppError(400, "Too many failed attempts. Please request a new code.");
            }

            throw new AppError(400, "Invalid reset code");
        }

        // 3. Update Password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        user.password = hashedPassword;
        await user.save({ session });

        // 4. Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save({ session });

        // OR delete it
        await OTP.deleteOne({ _id: otpRecord._id }).session(session);

        // 5. Revoke all existing sessions for this user (Security Best Practice)
        await RefreshToken.deleteMany({ userId: user._id }).session(session);

        if (isProduction) {
            await session.commitTransaction();
        }

        return {
            statusCode: 200,
            success: true,
            message: "Password has been reset successfully. Please login with your new password.",
        };
    } catch (error) {
        if (isProduction && session?.inTransaction()) {
            await session.abortTransaction();
        }
        if (error instanceof AppError) throw error;
        throw new AppError(500, error.message || "Failed to reset password");
    } finally {
        if (session) session.endSession();
    }
};

export default resetPasswordService;
