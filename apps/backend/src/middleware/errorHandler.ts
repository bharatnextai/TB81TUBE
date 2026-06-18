import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";
import { sendError } from "../utils/apiResponse.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return sendError(res, error.message, error.statusCode);
  }

  if (error instanceof ZodError) {
    return sendError(res, "Invalid request.", 400, error.flatten());
  }

  if (error instanceof Error) {
    return sendError(res, error.message, 500);
  }

  return sendError(res, "Unexpected server error.", 500);
};
