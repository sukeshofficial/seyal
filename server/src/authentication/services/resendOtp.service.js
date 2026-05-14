import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/users.model.js";
import OTP from "../models/otp.model.js";

import AppError from "../../utils/AppError.js";
import sendEmail from "../../utils/sendEmail.js";
import generateOtp from "../../utils/generateOtp.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Resend OTP Service
 * @param {Object} payload - { email, purpose }
 * @returns {Object} - Success response
 */
export const resendOtpService = async (payload) => {
    const isProduction = process.env.NODE_ENV === "production";
    const session = isProduction ? await mongoose.startSession() : null;

    try {
        const { email, purpose } = payload;
        const normalizedEmail = email.trim().toLowerCase();

        if (isProduction) {
            session.startTransaction();
        }

        // 1. Find User
        const user = await User.findOne({ email: normalizedEmail }).session(session);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        // 2. Check if already verified (for verify-email purpose)
        if (purpose === "verify-email" && user.isVerified) {
            throw new AppError(400, "Email already verified");
        }

        // 3. Generate New OTP
        const rawOtp = generateOtp();
        const hashedOtp = await bcrypt.hash(rawOtp, BCRYPT_SALT_ROUNDS);

        // 4. Upsert OTP Record
        // We use findOneAndUpdate to replace previous un-used OTP for the same purpose
        await OTP.findOneAndUpdate(
            { userId: user._id, purpose, isUsed: false },
            {
                otp: hashedOtp,
                attempts: 0,
                expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                session
            }
        );

        if (isProduction) {
            await session.commitTransaction();
        }

        // 5. Send Email (Asynchronous - non-blocking)
        await sendEmail({
            to: user.email,
            subject: `Verification code - SEYAL`,
            text: `Your new verification code is ${rawOtp}.`,
            html: `
                <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #111827;">
                    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center; margin-bottom: 32px;">
                            <img src="https://res.cloudinary.com/ddo5ryeor/image/upload/q_auto/f_auto/v1778730020/SEYAL-LOGO_m205k5.png" alt="SEYAL" style="height: 48px; width: auto;">
                        </div>
                        <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 8px; tracking: -0.02em;">New Verification Code</h1>
                        <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 32px;">You requested a new code. Enter it below to proceed with your action.</p>
                        
                        <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 32px;">
                            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Your New Code</div>
                            <div style="font-size: 38px; font-weight: 900; color: #4f46e5; letter-spacing: 8px; font-family: monospace;">${rawOtp}</div>
                            <div style="font-size: 13px; color: #94a3b8; margin-top: 16px;">Expires in 10 minutes</div>
                        </div>

                        <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                    <div style="text-align: center; margin-top: 24px;">
                        <p style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Securely processed by SEYAL Shield</p>
                    </div>
                </div>
            `,
        }).catch((emailError) => {
            console.error("Background Email sending failed on resend:", emailError.message);
        });

        return {
            statusCode: 200,
            success: true,
            message: "A new verification code has been sent to your email",
        };
    } catch (error) {
        if (isProduction && session?.inTransaction()) {
            await session.abortTransaction();
        }
        if (error instanceof AppError) throw error;
        throw new AppError(500, error.message || "Failed to resend OTP");
    } finally {
        if (session) session.endSession();
    }
};

export default resendOtpService;
