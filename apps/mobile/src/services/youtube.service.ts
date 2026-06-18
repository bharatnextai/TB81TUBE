import { api } from "./api";
import type { ApiEnvelope, YouTubePlaylist } from "../types";

export async function getYouTubePlaylists() {
  const response = await api.get<ApiEnvelope<{ playlists: YouTubePlaylist[] }>>("/api/v1/youtube/playlists");
  return response.data.data.playlists;
}
