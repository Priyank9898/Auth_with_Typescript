import express from "express";
import type { Express } from "express";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./common/middleware/error.middleware.js";
import { authRouter } from "./modules/auth/auth.route.js";
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Route
app.use("/auth-ts", authRouter);

//! Error Middleware
app.use(errorMiddleware);

export default app;
