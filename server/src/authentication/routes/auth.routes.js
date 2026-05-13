import { Router } from "express";
import passport from "passport";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { signupSchema } from "../validations/signup.validation.js";
import { verifyOtpSchema } from "../validations/otp.validation.js";
import { loginSchema } from "../validations/login.validation.js";
import {
    signupController,
    verifyOtpController,
    loginController,
    refreshTokenController,
    logoutController,
    meController,
    oauthCallbackController,
} from "../controllers/auth.controller.js";

const router = Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post("/signup", validate(signupSchema), signupController);

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify email using OTP
 * @access  Public
 */
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtpController);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validate(loginSchema), loginController);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", refreshTokenController);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and clear session
 * @access  Public
 */
router.post("/logout", logoutController);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user session
 * @access  Private
 */
router.get("/me", protect, meController);

/**
 * @route   GET /api/v1/auth/google
 * @desc    Login with Google
 */
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google auth callback
 */
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login?error=oauth_failed" }),
    oauthCallbackController
);

/**
 * @route   GET /api/v1/auth/github
 * @desc    Login with GitHub
 */
router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"], session: false })
);

/**
 * @route   GET /api/v1/auth/github/callback
 * @desc    GitHub auth callback
 */
router.get(
    "/github/callback",
    passport.authenticate("github", { session: false, failureRedirect: "/login?error=oauth_failed" }),
    oauthCallbackController
);

export default router;
