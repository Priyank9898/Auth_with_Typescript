import jwt from "jsonwebtoken";
const { TokenExpiredError, JsonWebTokenError, NotBeforeError } = jwt;

export const handleJWTerror = (
  err: unknown,
  message = "Invalid or expired token",
): never => {
  if (err instanceof TokenExpiredError) throw new Error("Token expired");
  if (err instanceof NotBeforeError) throw new Error("Token not active yet");
  if (err instanceof JsonWebTokenError) throw new Error("Invalid token");

  throw new Error(message);
};
