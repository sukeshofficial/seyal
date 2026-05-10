import { z } from "zod";

export const nameRegex = /^[A-Za-z]+(?:[' -][A-Za-z]+)*$/;

export const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export const usernameRegex = /^[a-zA-Z0-9_]+$/;

export const nameValidator = {
  validator: function (value) {
    return nameRegex.test(value);
  },

  message: (props) => `"${props.value}" is not a valid name`,
};

const nameField = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(50, "Cannot exceed 50 characters")
  .regex(nameRegex, "Invalid name format");

const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(
    usernameRegex,
    "Username can only contain letters, numbers, and underscores",
  );

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(emailRegex, "Please provide a valid email address");

const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const registerUserSchema = z.object({
  name: z.object({
    first: nameField,

    last: nameField,
  }),

  username: usernameField.default("anonymous"),

  email: emailField,

  password: passwordField,

  profilePicture: z
    .string()
    .url("Profile picture must be a valid URL")
    .optional(),

  provider: z.enum(["local", "google", "github"]).default("local"),

  isVerified: z.boolean().optional(),

  googleId: z.string().nullable().optional(),

  githubId: z.string().nullable().optional(),

  refreshToken: z.string().nullable().optional(),
});

export const loginUserSchema = z.object({
  email: emailField,

  password: passwordField,
});

export const updateUserSchema = registerUserSchema.partial();
