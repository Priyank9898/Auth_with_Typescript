import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error-response.js";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError && err.isOperational) {
    //* Known errors
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    //* Unknown errors
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
