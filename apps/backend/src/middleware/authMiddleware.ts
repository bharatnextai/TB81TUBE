import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sendError } from "../utils/apiResponse.js";

type AuthTokenPayload = {
  userId: string;
};

export type AuthenticatedRequest = Request & {
  userId: string;
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!token) {
    return sendError(res, "Missing authorization token", 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    (req as AuthenticatedRequest).userId = payload.userId;
    return next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
}
