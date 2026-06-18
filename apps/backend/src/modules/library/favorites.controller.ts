import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { contentItemBodySchema } from "./library.validation.js";
import { createFavorite, deleteFavorite, listFavorites } from "./favorites.service.js";

const favoriteParamsSchema = z.object({
  contentItemId: z.string().min(1, "contentItemId is required.")
});

export async function addFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const input = contentItemBodySchema.parse(req.body);
    const favorite = await createFavorite(userId, input.contentItem);

    return sendSuccess(res, "Favorite saved successfully", favorite, 201);
  } catch (error) {
    return next(error);
  }
}

export async function getFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const favorites = await listFavorites(userId);

    return sendSuccess(res, "Favorites fetched successfully", favorites);
  } catch (error) {
    return next(error);
  }
}

export async function removeFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const params = favoriteParamsSchema.parse(req.params);

    await deleteFavorite(userId, params.contentItemId);

    return sendSuccess(res, "Favorite removed successfully");
  } catch (error) {
    return next(error);
  }
}
