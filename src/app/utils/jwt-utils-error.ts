import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from "jsonwebtoken";
import { ApiError } from "./api-error-response.js";

export class JwtErrorResponse {
  static handleJwtError(err: unknown, msg = "Invalid or expired Token") {
    if (err instanceof TokenExpiredError) {
      throw ApiError.unauthorized("Token expired");
    } else if (err instanceof NotBeforeError) {
      throw ApiError.unauthorized("Token not active yet");
    } else if (err instanceof JsonWebTokenError) {
      throw ApiError.unauthorized("Invalid token");
    } else {
      throw ApiError.unauthorized(msg);
    }
  }
}
