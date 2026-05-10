import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { nameValidator, emailRegex } from "../validations/users.validation.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      first: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minlength: [2, "First name must be at least 2 characters"],
        maxlength: [50, "First name cannot exceed 50 characters"],
        validate: nameValidator,
      },

      last: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minlength: [2, "Last name must be at least 2 characters"],
        maxlength: [50, "Last name cannot exceed 50 characters"],
        validate: nameValidator,
      },
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      default: "anonymous",
    },

    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,

      match: [emailRegex, "Please provide a valid email address"],
    },

    password: {
      type: String,

      required: function () {
        return this.provider === "local";
      },

      minlength: [8, "Password must be at least 8 characters"],

      select: false,
    },

    profilePicture: {
      type: String,

      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },

    providers: {
      type: [String],

      enum: ["local", "google", "github"],

      default: ["local"],
    },

    isVerified: {
      type: Boolean,

      default: false,
    },

    googleId: {
      type: String,

      default: null,
    },

    githubId: {
      type: String,

      default: null,
    },
  },

  {
    timestamps: true,

    toJSON: {
      virtuals: true,

      transform: function (doc, ret) {
        delete ret.password;

        return ret;
      },
    },

    toObject: {
      virtuals: true,
    },
  },
);

userSchema.virtual("fullName").get(function () {
  return [this.name.first, this.name.last].filter(Boolean).join(" ");
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
