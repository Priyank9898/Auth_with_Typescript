import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { requireEnv } from "./require-env.js";

const accessTokenSecret = requireEnv("ACCESS_TOKEN_SECRET");
const refreshTokenSecret = requireEnv("REFRESH_TOKEN_SECRET");

const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, accessTokenSecret, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, refreshTokenSecret, {
    expiresIn: "7d",
  });
};

const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, accessTokenSecret) as JwtPayload;
};

const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, refreshTokenSecret) as JwtPayload;
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
