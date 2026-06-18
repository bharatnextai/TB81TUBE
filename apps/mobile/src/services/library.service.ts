import { api as apiClient } from "./api";
import type { ApiEnvelope, Favorite, Playlist, UnifiedContentItem, WatchHistoryItem } from "../types";

export async function saveFavorite(contentItem: UnifiedContentItem) {
  const response = await apiClient.post<ApiEnvelope<{ favorite: Favorite }>>("/api/v1/favorites", contentItem);
  return response.data.data.favorite;
}

export async function getFavorites() {
  const response = await apiClient.get<ApiEnvelope<{ items: Favorite[] }>>("/api/v1/favorites");
  return response.data.data.items;
}

export async function addHistory(contentItem: UnifiedContentItem, progressSeconds = 0) {
  const response = await apiClient.post<ApiEnvelope<{ historyItem: WatchHistoryItem }>>("/api/v1/history", {
    ...contentItem,
    progressSeconds
  });
  return response.data.data.historyItem;
}

export async function getHistory() {
  const response = await apiClient.get<ApiEnvelope<{ items: WatchHistoryItem[] }>>("/api/v1/history");
  return response.data.data.items;
}

export async function clearHistory() {
  await apiClient.delete("/api/v1/history");
}

export async function getPlaylists() {
  const response = await apiClient.get<ApiEnvelope<{ items: Playlist[] }>>("/api/v1/playlists");
  return response.data.data.items;
}

export async function createPlaylist(input: { name: string; description?: string }) {
  const response = await apiClient.post<ApiEnvelope<{ playlist: Playlist }>>("/api/v1/playlists", input);
  return response.data.data.playlist;
}

export async function getPlaylist(id: string) {
  const response = await apiClient.get<ApiEnvelope<{ playlist: Playlist }>>(`/api/v1/playlists/${id}`);
  return response.data.data.playlist;
}

export async function updatePlaylist(id: string, input: { name?: string; description?: string | null }) {
  const response = await apiClient.patch<ApiEnvelope<{ playlist: Playlist }>>(`/api/v1/playlists/${id}`, input);
  return response.data.data.playlist;
}

export async function deletePlaylist(id: string) {
  await apiClient.delete(`/api/v1/playlists/${id}`);
}

export async function addPlaylistItem(playlistId: string, contentItem: UnifiedContentItem) {
  await apiClient.post(`/api/v1/playlists/${playlistId}/items`, contentItem);
}

export async function removePlaylistItem(playlistId: string, contentItemId: string) {
  await apiClient.delete(`/api/v1/playlists/${playlistId}/items/${contentItemId}`);
}
