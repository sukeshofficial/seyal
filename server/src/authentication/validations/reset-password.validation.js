import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address"),

    otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export default {
    forgotPasswordSchema,
    resetPasswordSchema,
};
