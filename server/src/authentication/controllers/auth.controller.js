import bcrypt from "bcryptjs";
import signupService from "../services/signup.service.js";
import verifyOtpService from "../services/verifyOtp.service.js";
import resendOtpService from "../services/resendOtp.service.js";
import loginService from "../services/login.service.js";
import refreshTokenService from "../services/refresh-token.service.js";
import logoutService from "../services/logout.service.js";
import meService from "../services/me.service.js";
import forgotPasswordService from "../services/forgotPassword.service.js";
import resetPasswordService from "../services/resetPassword.service.js";
import getPublicAvatarService from "../services/public-profile.service.js";
import RefreshToken from "../models/refresh-token.model.js";
import generateTokens from "../../utils/generateTokens.js";
import jwtConfig from "../../config/jwt.config.js";

export const signupController = async (req, res, next) => {
  try {
    const { statusCode, ...response } = await signupService(req.body);

    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export const verifyOtpController = async (req, res, next) => {
  try {
    const { statusCode, success, message, data } = await verifyOtpService(req.body);

    if (success && data?.user) {
      const user = data.user;
      const userId = user.id || user._id;

      // 1. Generate tokens
      const { accessToken, refreshToken } = generateTokens({
        _id: userId,
        email: user.email,
        providers: user.providers || ["local"]
      });

      // 2. Hash and store refresh token
      const BCRYPT_SALT_ROUNDS = 12;
      const hashedToken = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);

      const isProduction = process.env.NODE_ENV === "production";
      const refreshExpiresIn = jwtConfig.refresh.expiresIn || "7d";
      let expiryMs = 7 * 24 * 60 * 60 * 1000;

      if (typeof refreshExpiresIn === "number") {
        expiryMs = refreshExpiresIn;
      } else if (typeof refreshExpiresIn === "string") {
        const unit = refreshExpiresIn.slice(-1);
        const value = parseInt(refreshExpiresIn.slice(0, -1));
        if (!isNaN(value)) {
          if (unit === "d") expiryMs = value * 24 * 60 * 60 * 1000;
          else if (unit === "h") expiryMs = value * 60 * 60 * 1000;
          else if (unit === "m") expiryMs = value * 60 * 1000;
          else if (unit === "s") expiryMs = value * 1000;
        }
      }

      await RefreshToken.create({
        userId,
        hashedToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + expiryMs),
      });

      // 3. Set Cookies
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
      };

      res.cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 min
      });

      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return res.status(statusCode).json({
      success,
      message,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const { statusCode, success, message, data } = await loginService(req.body, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    if (success && data?.accessToken && data?.refreshToken) {
      const isProduction = process.env.NODE_ENV === "production";

      // Set Access Token Cookie
      res.cookie("accessToken", data.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      });

      // Set Refresh Token Cookie
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove tokens from JSON response
      delete data.accessToken;
      delete data.refreshToken;
    }

    return res.status(statusCode).json({
      success,
      message,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.cookies;

    const { statusCode, success, message, data } = await refreshTokenService(
      token,
      {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      },
    );

    if (success && data?.accessToken && data?.refreshToken) {
      const isProduction = process.env.NODE_ENV === "production";

      // Update Access Token Cookie
      res.cookie("accessToken", data.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 min
      });

      // Update Refresh Token Cookie
      res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return res.status(statusCode).json({
      success,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.cookies;
    const userAgent = req.headers["user-agent"];

    const { statusCode, ...response } = await logoutService(token, userAgent);

    const isProduction = process.env.NODE_ENV === "production";

    // Clear all auth cookies — path must exactly match how they were set
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
    };

    res.clearCookie("accessToken", clearOptions);
    res.clearCookie("refreshToken", clearOptions);
    // Clear any Passport session cookies that may have been created
    res.clearCookie("session", { path: "/" });
    res.clearCookie("connect.sid", { path: "/" });

    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export const oauthCallbackController = async (req, res, next) => {
  try {
    const user = req.user;

    // 1. Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // 2. Hash and store refresh token
    const BCRYPT_SALT_ROUNDS = 12;
    const hashedToken = await bcrypt.hash(refreshToken, BCRYPT_SALT_ROUNDS);

    // Calculate expiry: default to 7 days if not a number
    const refreshExpiresIn = jwtConfig.refresh.expiresIn || "7d";
    let expiryMs = 7 * 24 * 60 * 60 * 1000; // Default 7 days

    if (typeof refreshExpiresIn === "number") {
      expiryMs = refreshExpiresIn;
    } else if (typeof refreshExpiresIn === "string") {
      const unit = refreshExpiresIn.slice(-1);
      const value = parseInt(refreshExpiresIn.slice(0, -1));
      if (!isNaN(value)) {
        if (unit === "d") expiryMs = value * 24 * 60 * 60 * 1000;
        else if (unit === "h") expiryMs = value * 60 * 60 * 1000;
        else if (unit === "m") expiryMs = value * 60 * 1000;
        else if (unit === "s") expiryMs = value * 1000;
      }
    }

    const expiresAt = new Date(Date.now() + expiryMs);

    await RefreshToken.create({
      userId: user._id,
      hashedToken,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      expiresAt,
    });

    // 3. Set cookies
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 4. Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/`);
  } catch (error) {
    next(error);
  }
};

export const resendOtpController = async (req, res, next) => {
  try {
    const { statusCode, ...response } = await resendOtpService(req.body);

    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { statusCode, ...response } = await forgotPasswordService(req.body);
    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { statusCode, ...response } = await resetPasswordService(req.body);
    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export const getAvatarController = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const { statusCode, ...response } = await getPublicAvatarService(identifier);
    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export const meController = async (req, res, next) => {
  try {
    const { statusCode, ...response } = await meService(req.user.id);
    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export default {
  signupController,
  verifyOtpController,
  loginController,
  refreshTokenController,
  logoutController,
  resendOtpController,
  forgotPasswordController,
  resetPasswordController,
  meController,
  oauthCallbackController,
  getAvatarController,
};
