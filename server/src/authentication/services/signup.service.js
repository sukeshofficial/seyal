import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/users.model.js";
import OTP from "../models/otp.model.js";

import AppError from "../../utils/AppError.js";
import sendEmail from "../../utils/sendEmail.js";
import generateOtp from "../../utils/generateOtp.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const BCRYPT_SALT_ROUNDS = 12;
const OTP_PURPOSE = "verify-email";

const buildSafeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete user.password;
  return user;
};

export const signupService = async (payload) => {
  const isProduction = process.env.NODE_ENV === "produtction";

  const session = isProduction ? await mongoose.startSession() : null;

  try {
    const { name, username, email, password } = payload;

    // Normalize data
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (isProduction) {
      session.startTransaction();
    }

    // 1. Check Duplicate Email
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    })
      .session(session)
      .lean();

    if (existingEmail) {
      throw new AppError(409, "Email Already exists");
    }

    // 2. Check Duplicate UserName
    const existingUsername = await User.findOne({
      username: normalizedUsername,
    })
      .session(session)
      .lean();

    if (existingUsername) {
      throw new AppError(409, "Username Already exists");
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 4. Create User
    const createdUsers = await User.create(
      [
        {
          name: {
            first: name.first.trim(),
            last: name.last.trim(),
          },
          username: normalizedUsername,
          email: normalizedEmail,
          password: hashedPassword,
          providers: ["local"],
          isVerified: false,
        },
      ],
      isProduction ? { session } : {},
    );

    const user = createdUsers[0];

    // 5. OTP
    const rawOtp = generateOtp();

    // 6. Hash OTP
    const hashedOtp = await bcrypt.hash(rawOtp, BCRYPT_SALT_ROUNDS);

    // 7. Save OTP
    await OTP.create(
      [
        {
          userId: user._id,
          otp: hashedOtp,
          purpose: OTP_PURPOSE,
          attempts: 0,
          isUsed: false,
          expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        },
      ],
      isProduction ? { session } : {},
    );

    // Commit DB Transaction
    if (isProduction) {
      await session.commitTransaction();
    }

    // 8. Send Email (Asynchronous - non-blocking)
    await sendEmail({
      to: user.email,
      subject: "Verify your email - SEYAL",
      text: `Hello ${user.name.first}, your verification code is ${rawOtp}.`,
      html: `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #111827;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://res.cloudinary.com/ddo5ryeor/image/upload/q_auto/f_auto/v1778730020/SEYAL-LOGO_m205k5.png" alt="SEYAL" style="height: 48px; width: auto;">
            </div>
            <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 8px; tracking: -0.02em;">Welcome to SEYAL</h1>
            <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 32px;">Verify your identity to start building on the ecosystem.</p>
            
            <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 32px;">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Your Verification Code</div>
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
    })
      .catch((emailError) => {
        console.error("Background Email sending failed on signup:", emailError.message);
        // Note: We don't throw here as the user is already created. 
        // They can hit 'Resend' if the email never arrives.
      });

    // 9. Return Success
    return {
      statusCode: 201,
      success: true,
      message: "Signup successful. Verification OTP sent to email.",
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
      },
    };
  } catch (error) {
    if (isProduction && session?.inTransaction()) {
      await session.abortTransaction();
    }

    // Handle Mongo duplicate key
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      if (field === "email") {
        throw new AppError(409, "Email already exists");
      }

      if (field === "username") {
        throw new AppError(409, "Username already exists");
      }

      throw new AppError(409, "Duplicate field value");
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, error.message || "Signup failed");
  } finally {
    session?.endSession();
  }
};

export default signupService;
