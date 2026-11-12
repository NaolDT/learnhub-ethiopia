import { Router } from "express";
import validate from "../../middlewares/validate.js";
import authenticate from "../../middlewares/authenticate.js";
import { loginLimiter, registerLimiter } from "../../middlewares/rateLimiters.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", registerLimiter, validate(registerSchema), authController.register);
router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;