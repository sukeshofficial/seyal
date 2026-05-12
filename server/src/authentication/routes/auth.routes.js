import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { signupSchema } from "../validations/signup.validation.js";
import { signupController } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register new user
 * @access  Public
 */
router.post("/signup", validate(signupSchema), signupController);

export default router;
