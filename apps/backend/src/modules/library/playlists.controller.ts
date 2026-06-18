import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { contentItemBodySchema, createPlaylistSchema, updatePlaylistSchema } from "./library.validation.js";
import {
  addItemToPlaylist,
  createLocalPlaylist,
  deleteLocalPlaylist,
  getLocalPlaylist,
  listLocalPlaylists,
  removeItemFromPlaylist,
  updateLocalPlaylist
} from "./playlists.service.js";

const playlistParamsSchema = z.object({
  id: z.string().min(1, "Playlist id is required.")
});

const playlistItemParamsSchema = z.object({
  id: z.string().min(1, "Playlist id is required."),
  contentItemId: z.string().min(1, "contentItemId is required.")
});

export async function createPlaylist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const input = createPlaylistSchema.parse(req.body);
    const playlist = await createLocalPlaylist(userId, input);

    return sendSuccess(res, "Playlist created successfully", playlist, 201);
  } catch (error) {
    return next(error);
  }
}

export async function getPlaylists(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const playlists = await listLocalPlaylists(userId);

    return sendSuccess(res, "Playlists fetched successfully", playlists);
  } catch (error) {
    return next(error);
  }
}

export async function getPlaylist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const params = playlistParamsSchema.parse(req.params);
    const playlist = await getLocalPlaylist(userId, params.id);

    return sendSuccess(res, "Playlist fetched successfully", playlist);
  } catch (error) {
    return next(error);
  }
}

export async function updatePlaylist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const params = playlistParamsSchema.parse(req.params);
    const input = updatePlaylistSchema.parse(req.body);
    const playlist = await updateLocalPlaylist(userId, params.id, input);

    return sendSuccess(res, "Playlist updated successfully", playlist);
  } catch (error) {
    return next(error);
  }
}

export async function deletePlaylist(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const params = playlistParamsSchema.parse(req.params);

    await deleteLocalPlaylist(userId, params.id);

    return sendSuccess(res, "Playlist deleted successfully");
  } catch (error) {
    return next(error);
  }
}

export async function addPlaylistItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const params = playlistParamsSchema.parse(req.params);
    const input = contentItemBodySchema.parse(req.body);
    const playlistItem = await addItemToPlaylist(userId, params.id, input.contentItem);

    return sendSuccess(res, "Playlist item added successfully", playlistItem, 201);
  } catch (error) {
    return next(error);
  }
}

export async function removePlaylistItem(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const params = playlistItemParamsSchema.parse(req.params);

    await removeItemFromPlaylist(userId, params.id, params.contentItemId);

    return sendSuccess(res, "Playlist item removed successfully");
  } catch (error) {
    return next(error);
  }
}
