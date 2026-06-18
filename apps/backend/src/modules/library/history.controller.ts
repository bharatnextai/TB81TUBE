import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { watchHistoryBodySchema } from "./library.validation.js";
import { clearWatchHistory, listWatchHistory, upsertWatchHistory } from "./history.service.js";

export async function saveHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const input = watchHistoryBodySchema.parse(req.body);
    const historyItem = await upsertWatchHistory(userId, input.contentItem, input.progressSeconds);

    return sendSuccess(res, "Watch history saved successfully", historyItem, 201);
  } catch (error) {
    return next(error);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const history = await listWatchHistory(userId);

    return sendSuccess(res, "Watch history fetched successfully", history);
  } catch (error) {
    return next(error);
  }
}

export async function clearHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    await clearWatchHistory(userId);

    return sendSuccess(res, "Watch history cleared successfully");
  } catch (error) {
    return next(error);
  }
}
