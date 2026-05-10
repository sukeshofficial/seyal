import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Email or username must be at least 3 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export default loginSchema;