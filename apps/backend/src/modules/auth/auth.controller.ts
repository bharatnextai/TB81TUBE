import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const data = await registerUser(input);
    return sendSuccess(res, "User registered successfully", data, 201);
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const data = await loginUser(input);
    return sendSuccess(res, "Login successful", data);
  } catch (error) {
    return next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getCurrentUser((req as AuthenticatedRequest).userId);
    return sendSuccess(res, "Current user fetched successfully", { user });
  } catch (error) {
    return next(error);
  }
}
