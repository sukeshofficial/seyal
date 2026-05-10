import { z } from "zod";

export const refreshSchema = z.object({
  deviceInfo: z
    .string()
    .trim()
    .max(255, "Device info cannot exceed 255 characters")
    .optional(),

  logoutAll: z.boolean().optional(),
});

export default refreshSchema;
