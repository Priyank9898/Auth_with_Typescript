// import { ApiError } from "./api-error-response.js";
import { ApiError } from "./api-error-response.js";

export const requireEnv = function (input: string) {
  const environmentVariable = process.env[input];
  if (!environmentVariable)
    throw ApiError.unauthorized(`${environmentVariable} not present`);
  return environmentVariable;
};
