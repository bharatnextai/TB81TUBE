import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth";
import type { ContentItem } from "../types/content";

export type FavoriteRecord = {
  id: string;
  contentItem: ContentItem;
  createdAt?: string;
};

export type HistoryRecord = {
  id: string;
  contentItem: ContentItem;
  watchedAt: string;
  progressSeconds: number;
};

export type PlaylistRecord = {
  id: string;
  name: string;
  description: string | null;
  createdAt?: string;
  items?: PlaylistItemRecord[];
};

export type PlaylistItemRecord = {
  id: string;
  contentItemId: string;
  addedAt: string;
  contentItem: ContentItem;
};

export async function addToHistory(contentItem: ContentItem, progressSeconds = 0) {
  await apiClient.post<ApiResponse<unknown>>("/history", {
    contentItem: normalizeContentItemForBackend(contentItem),
    progressSeconds
  });
}

export async function addToFavorites(contentItem: ContentItem) {
  await apiClient.post<ApiResponse<unknown>>("/favorites", {
    contentItem: normalizeContentItemForBackend(contentItem)
  });
}

export async function getFavorites() {
  const response = await apiClient.get<ApiResponse<FavoriteRecord[]>>("/favorites");

  return response.data.data;
}

export async function getHistory() {
  const response = await apiClient.get<ApiResponse<HistoryRecord[]>>("/history");

  return response.data.data;
}

export async function clearHistory() {
  await apiClient.delete<ApiResponse<unknown>>("/history");
}

export async function getPlaylists() {
  const response = await apiClient.get<ApiResponse<PlaylistRecord[]>>("/playlists");

  return response.data.data;
}

export async function createPlaylist(name: string, description?: string | null) {
  const response = await apiClient.post<ApiResponse<PlaylistRecord>>("/playlists", {
    name,
    description: description || null
  });

  return response.data.data;
}

export async function getPlaylistById(id: string) {
  const response = await apiClient.get<ApiResponse<PlaylistRecord>>(`/playlists/${id}`);

  return response.data.data;
}

export async function updatePlaylist(id: string, payload: { name?: string; description?: string | null }) {
  const response = await apiClient.patch<ApiResponse<PlaylistRecord>>(`/playlists/${id}`, payload);

  return response.data.data;
}

export async function deletePlaylist(id: string) {
  await apiClient.delete<ApiResponse<unknown>>(`/playlists/${id}`);
}

export async function addItemToPlaylist(playlistId: string, contentItem: ContentItem) {
  await apiClient.post<ApiResponse<PlaylistItemRecord>>(`/playlists/${playlistId}/items`, {
    contentItem: normalizeContentItemForBackend(contentItem)
  });
}

export async function removeItemFromPlaylist(playlistId: string, contentItemId: string) {
  await apiClient.delete<ApiResponse<unknown>>(`/playlists/${playlistId}/items/${contentItemId}`);
}

function normalizeContentItemForBackend(contentItem: ContentItem) {
  return {
    ...contentItem,
    duration: typeof contentItem.duration === "number" ? contentItem.duration : null
  };
}
