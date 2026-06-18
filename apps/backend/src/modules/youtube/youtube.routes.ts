import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  getYouTubeChannel,
  getYouTubePlaylistVideos,
  getYouTubePlaylists,
  searchYouTube
} from "./youtube.controller.js";

export const youtubeRouter = Router();

youtubeRouter.get("/channel", authMiddleware, getYouTubeChannel);
youtubeRouter.get("/playlists", authMiddleware, getYouTubePlaylists);
youtubeRouter.get("/playlists/:playlistId/videos", authMiddleware, getYouTubePlaylistVideos);
youtubeRouter.get("/search", authMiddleware, searchYouTube);
