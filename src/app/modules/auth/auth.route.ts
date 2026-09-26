import express from "express";
import type { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { registerSchema } from "./dto/register-dto.js";
import { loginSchema } from "./dto/login-dto.js";

export const authRouter: Router = express.Router();

authRouter.post("/sign-up", validate(registerSchema), AuthController.register);
authRouter.post("/login", validate(loginSchema), AuthController.login);

authRouter.get("/verify-email/:token", AuthController.emailVerification);
authRouter.post("/refresh", AuthController.refresh);
