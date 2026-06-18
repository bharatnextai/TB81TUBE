import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { clearUserSearchHistory, getUserSearchHistory, unifiedSearch } from "./search.service.js";
import { searchQuerySchema } from "./search.validation.js";

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const input = searchQuerySchema.parse(req.query);
    const result = await unifiedSearch(userId, input);

    return sendSuccess(res, "Search completed successfully", result);
  } catch (error) {
    return next(error);
  }
}

export async function getSearchHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const history = await getUserSearchHistory(userId);

    return sendSuccess(res, "Search history fetched successfully", history);
  } catch (error) {
    return next(error);
  }
}

export async function clearSearchHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    await clearUserSearchHistory(userId);

    return sendSuccess(res, "Search history cleared successfully");
  } catch (error) {
    return next(error);
  }
}
