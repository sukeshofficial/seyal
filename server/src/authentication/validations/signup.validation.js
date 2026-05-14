import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.object({
      first: z
        .string()
        .trim()
        .min(1, "First name must be at least 1 characters")
        .max(50, "First name cannot exceed 50 characters")
        .regex(/^[A-Za-z]+$/, "First name must contain letters only"),

      last: z
        .string()
        .trim()
        .min(1, "Last name must be at least 1 characters")
        .max(50, "Last name cannot exceed 50 characters")
        .regex(/^[A-Za-z]+$/, "Last name must contain letters only"),
    }),

    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters")
      .toLowerCase()
      .regex(
        /^[a-z0-9_-]+$/,
        "Username can only contain lowercase letters, numbers, underscores, and hyphens",
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default signupSchema;
