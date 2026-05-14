import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/users.model.js";
import OTP from "../models/otp.model.js";

import AppError from "../../utils/AppError.js";

const OTP_MAX_ATTEMPTS = 5;

/**
 * Verify OTP Service
 * @param {Object} payload - { email, otp, purpose }
 * @returns {Object} - Success response or throws AppError
 */
export const verifyOtpService = async (payload) => {
    const isProduction = process.env.NODE_ENV === "production";
    const session = isProduction ? await mongoose.startSession() : null;

    try {
        const { email, otp: userInputOtp, purpose } = payload;

        // 1. Find User
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).session(session);

        if (!user) {
            throw new AppError(404, "User not found");
        }

        // 2. Already Verified Check
        if (user.isVerified) {
            throw new AppError(400, "Email already verified");
        }

        // 3. Find Active OTP
        const activeOtp = await OTP.findOne({
            userId: user._id,
            purpose,
            isUsed: false,
        }).session(session);

        if (!activeOtp) {
            throw new AppError(404, "No active OTP found");
        }

        // 4. Expiry Check
        if (activeOtp.expiresAt < Date.now()) {
            throw new AppError(400, "OTP expired");
        }

        // 5. Attempt Limit Check
        if (activeOtp.attempts >= OTP_MAX_ATTEMPTS) {
            throw new AppError(429, "Too many attempts. Please request a new OTP");
        }

        // 6. Compare OTP
        const isMatch = await bcrypt.compare(userInputOtp, activeOtp.otp);

        if (!isMatch) {
            // Increment attempts
            activeOtp.attempts += 1;
            await activeOtp.save({ session });

            throw new AppError(400, "Invalid OTP");
        }

        // 7. Success Flow - Mongoose Transaction
        if (isProduction) {
            session.startTransaction();
        }

        // Update User
        user.isVerified = true;
        await user.save({ session });

        // Mark OTP Used
        activeOtp.isUsed = true;
        await activeOtp.save({ session });

        // Commit DB Transaction
        if (isProduction) {
            await session.commitTransaction();
        }

        // 8. Return Success
        return {
            statusCode: 200,
            success: true,
            message: "Email verified successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    isVerified: user.isVerified,
                }
            }
        };
    } catch (error) {
        if (isProduction && session?.inTransaction()) {
            await session.abortTransaction();
        }

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(500, error.message || "Verification failed");
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

export default verifyOtpService;
