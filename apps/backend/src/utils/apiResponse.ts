import type { Response } from "express";

export type ApiResponseBody<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode = 200) {
  const body: ApiResponseBody<T> = {
    success: true,
    message,
    ...(data === undefined ? {} : { data })
  };

  return res.status(statusCode).json(body);
}

export function sendError(res: Response, message: string, statusCode = 500, data?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(data === undefined ? {} : { data })
  });
}
