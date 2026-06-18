import { Router } from "express";
import { z } from "zod";
import { getAuthUser, requireAuth } from "../middleware/authMiddleware.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { youtubeConnector } from "../modules/platforms/connectors/connectorRegistry.js";

export const youtubeRouter = Router();

const searchSchema = z.object({
  q: z.string().min(1),
  order: z.enum(["date", "rating", "relevance", "title", "videoCount", "viewCount"]).optional(),
  duration: z.enum(["any", "short", "medium", "long"]).default("any")
});

youtubeRouter.use(requireAuth);

youtubeRouter.get("/channel", async (req, res, next) => {
  try {
    const userId = getAuthUser(req).sub;
    const channel = await youtubeConnector.getProfile({ userId });
    return sendSuccess(res, "YouTube channel fetched successfully.", { channel });
  } catch (error) {
    return next(error);
  }
});

youtubeRouter.get("/playlists", async (req, res, next) => {
  try {
    const userId = getAuthUser(req).sub;
    const playlists = await youtubeConnector.getPlaylists({ userId });
    return sendSuccess(res, "YouTube playlists fetched successfully.", { playlists });
  } catch (error) {
    return next(error);
  }
});

youtubeRouter.get("/playlists/:playlistId/videos", async (req, res, next) => {
  try {
    const userId = getAuthUser(req).sub;
    const params = z.object({ playlistId: z.string().min(1) }).parse(req.params);
    const items = await youtubeConnector.getPlaylistItems({ userId, playlistId: params.playlistId });
    return sendSuccess(res, "YouTube playlist videos fetched successfully.", { items });
  } catch (error) {
    return next(error);
  }
});

youtubeRouter.get("/search", async (req, res, next) => {
  try {
    const userId = getAuthUser(req).sub;
    const input = searchSchema.parse(req.query);
    const items = await youtubeConnector.search({
      userId,
      query: input.q,
      filters: {
        order: input.order,
        duration: input.duration
      }
    });

    return sendSuccess(res, "YouTube search completed successfully.", { items });
  } catch (error) {
    return next(error);
  }
});
