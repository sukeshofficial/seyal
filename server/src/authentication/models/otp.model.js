import mongoose from "mongoose";

const { Schema } = mongoose;


const otpSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: [true, "OTP is required"],
    },

    purpose: {
      type: String,
      enum: ["verify-email", "forgot-password", "change-email", "2fa"],
      required: [true, "Purpose of OTP is required"],
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },

  {
    timestamps: true,
  },
);

otpSchema.index(
  { userId: 1, purpose: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isUsed: false,
    },
  },
);

const OTP = mongoose.model("Otp", otpSchema);

export default OTP;
