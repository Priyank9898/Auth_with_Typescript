import type { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error-response.js";

export const validate = function (data: ZodType) {
  return async function (req: Request, res: Response, next: NextFunction) {
    const validateResult = await data.safeParseAsync(req.body);
    if (!validateResult.success) {
      return next(
        ApiError.badRequest(
          validateResult.error.issues.map((e) => e.message).join("; "),
        ),
      );
    }

    req.body = validateResult.data;
    return next();
  };
};
