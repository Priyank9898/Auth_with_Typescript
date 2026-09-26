import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { requireEnv } from "./require-env.js";
import crypto from "node:crypto";

const accessTokenSecret = requireEnv("ACCESS_TOKEN_SECRET");
const refreshTokenSecret = requireEnv("REFRESH_TOKEN_SECRET");

export class JwtUtils {
  static generateAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, accessTokenSecret, {
      expiresIn: "15m",
    });
  }

  static generateRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, refreshTokenSecret, {
      expiresIn: "7d",
    });
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, accessTokenSecret) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, refreshTokenSecret) as JwtPayload;
  }

  static generateResetToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    return { rawToken, hashedToken };
  };
}
