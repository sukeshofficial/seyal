import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/users.model.js";
import OTP from "../models/otp.model.js";

import AppError from "../../utils/AppError.js";

const OTP_PURPOSE = "forgot-password";

/**
 * Verify Reset OTP Service
 * @param {Object} payload - { email, otp }
 * @returns {Object} - Success response
 */
export const verifyResetOtpService = async (payload) => {
    const isProduction = process.env.NODE_ENV === "production";
    const session = isProduction ? await mongoose.startSession() : null;

    try {
        const { email, otp } = payload;
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

        // Check if expired
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

        // Note: We DO NOT mark it as used here, because it will be needed
        // to actually reset the password in the final step.

        if (isProduction) {
            await session.commitTransaction();
        }

        return {
            statusCode: 200,
            success: true,
            message: "OTP verified successfully. You can now reset your password.",
        };
    } catch (error) {
        if (isProduction && session?.inTransaction()) {
            await session.abortTransaction();
        }
        if (error instanceof AppError) throw error;
        throw new AppError(500, error.message || "Failed to verify OTP");
    } finally {
        if (session) session.endSession();
    }
};

export default verifyResetOtpService;
