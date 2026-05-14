import { z } from "zod";

export const signupSchema = z
    .object({
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters")
            .trim(),
        lastName: z
            .string()
            .min(1, "Last name must be at least 1 characters")
            .trim(),
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username cannot exceed 30 characters")
            .trim()
            .toLowerCase(),
        email: z.string().email("Please enter a valid email address").toLowerCase(),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
        profilePicture: z.any().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const loginSchema = z.object({
    identifier: z.string().min(1, "Email or username is required").trim().toLowerCase(),
    password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address").toLowerCase(),
});

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
