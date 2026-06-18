import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import {
  fetchMyYouTubeChannel,
  fetchMyYouTubePlaylists,
  fetchYouTubePlaylistVideos,
  searchYouTubeVideos
} from "./youtube.service.js";

const playlistParamsSchema = z.object({
  playlistId: z.string().min(1, "playlistId is required.")
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required."),
  maxResults: z.coerce.number().int().min(1).max(25).optional().default(10),
  pageToken: z.string().min(1).optional()
});

export async function getYouTubeChannel(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const channel = await fetchMyYouTubeChannel(userId);

    return sendSuccess(res, "YouTube channel fetched successfully", channel);
  } catch (error) {
    return next(error);
  }
}

export async function getYouTubePlaylists(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const playlists = await fetchMyYouTubePlaylists(userId);

    return sendSuccess(res, "YouTube playlists fetched successfully", playlists);
  } catch (error) {
    return next(error);
  }
}

export async function getYouTubePlaylistVideos(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { playlistId } = playlistParamsSchema.parse(req.params);
    const videos = await fetchYouTubePlaylistVideos(userId, playlistId);

    return sendSuccess(res, "YouTube playlist videos fetched successfully", videos);
  } catch (error) {
    return next(error);
  }
}

export async function searchYouTube(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const query = searchQuerySchema.parse(req.query);
    const result = await searchYouTubeVideos(userId, query.q, {
      maxResults: query.maxResults,
      pageToken: query.pageToken
    });

    return sendSuccess(res, "YouTube search completed successfully", result);
  } catch (error) {
    return next(error);
  }
}
