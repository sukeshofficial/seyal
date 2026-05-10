import { z } from "zod";

const otpPurposeEnum = z.enum([
  "verify-email",
  "forgot-password",
  "change-email",
  "2fa",
]);

// Verify OTP Schema
export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Email or userId is required"),

  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),

  purpose: otpPurposeEnum,
});

// Resend OTP Schema
export const resendOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Email or userId is required"),

  purpose: otpPurposeEnum,
});

export default {
  verifyOtpSchema,
  resendOtpSchema,
};
