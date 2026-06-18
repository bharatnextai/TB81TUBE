import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  addPlaylistItem,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  getPlaylists,
  removePlaylistItem,
  updatePlaylist
} from "./playlists.controller.js";

export const playlistsRouter = Router();

playlistsRouter.use(authMiddleware);

playlistsRouter.post("/", createPlaylist);
playlistsRouter.get("/", getPlaylists);
playlistsRouter.get("/:id", getPlaylist);
playlistsRouter.patch("/:id", updatePlaylist);
playlistsRouter.delete("/:id", deletePlaylist);
playlistsRouter.post("/:id/items", addPlaylistItem);
playlistsRouter.delete("/:id/items/:contentItemId", removePlaylistItem);
