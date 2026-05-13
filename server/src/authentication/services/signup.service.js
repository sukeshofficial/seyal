import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import User from "../models/users.model.js";
import OTP from "../models/otp.model.js";

import AppError from "../../utils/AppError.js";
import sendEmail from "../../utils/sendEmail.js";
import generateOtp from "../../utils/generateOtp.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
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

    // 8. Send Email
    try {
      await sendEmail({
        to: user.email,
        subject: "Complete your SEYAL registration - Verification Code",
        text: `Hello ${user.name.first}, your verification code is ${rawOtp}. It expires in 5 minutes.`,
        html: `<div style="font-family:'Poppins',sans-serif;max-width:500px;margin:40px auto;background:#fff;padding:40px;border-radius:20px;border:1px solid #e2e8f0;">
            <h2 style="color:#2563eb;text-align:center;">Complete your registration</h2>
            <p style="color:#475569;text-align:center;">You started signing up but didn't verify your email. Use the code below to finish.</p>
            <div style="font-size:32px;font-weight:800;color:#2563eb;letter-spacing:12px;text-align:center;padding:24px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:16px;">${rawOtp}</div>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:12px;">Expires in <strong>5 minutes</strong></p>
          </div>`,
      });
    } catch (emailError) {
      return {
        statusCode: 201,
        success: true,
        message:
          "Account created but verification email could not be sent. Please resend OTP.",
        requiresOtpResend: true,
        data: {
          id: user._id,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
        },
      };
    }

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
