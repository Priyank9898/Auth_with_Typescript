import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error-response.js";
import { verifyAccessToken } from "../utils/jwt-utils.js";
import { handleJWTerror } from "../utils/jwt-utils-error.js";
import type { JwtPayload } from "jsonwebtoken";

export function authenticationMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      next();
      return;
    }

    let decode: JwtPayload;

    try {
      decode = verifyAccessToken(token);
    } catch (err) {
      handleJWTerror(err, "Invalid or expired access token");
      return;
    }

    // will get ID from this
    req.user = decode;

    next();
  };
}

export function restrictToAuthenticatedUser() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized("Authentication required");
    next();
  };
}
