export class ApiError extends Error {
  errorCode: number;
  isOperational: boolean;
  details?: unknown;

  constructor(message: string, errorCode: number, details?: unknown) {
    super(message);
    this.errorCode = errorCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError(message, 400, details);
  }

  static unauthorized(message = "Unauthorized", details?: unknown) {
    return new ApiError(message, 401, details);
  }

  static forbidden(message = "Forbidden", details?: unknown) {
    return new ApiError(message, 403, details);
  }

  static notFound(message = "Not found", details?: unknown) {
    return new ApiError(message, 404, details);
  }

  static internal(message = "Internal server error", details?: unknown) {
    return new ApiError(message, 500, details);
  }

  static conflict(message = "Conflict", details?: unknown) {
    return new ApiError(message, 409, details);
  }
}
