import { envDiagnostics } from "../../config/env.js";
import {
  getMyChannel,
  getMyPlaylists,
  getPlaylistVideos,
  searchVideos,
  type YouTubeSearchOptions
} from "../platforms/youtube/youtubeApi.service.js";
import {
  getMockYouTubeChannel,
  getMockYouTubePlaylistVideos,
  getMockYouTubePlaylists,
  searchMockYouTubeVideos
} from "./youtube.mock.js";

export function isMockYouTubeEnabled() {
  return envDiagnostics.devMockYouTubeAuthEnabled;
}

export function fetchMyYouTubeChannel(userId: string) {
  if (isMockYouTubeEnabled()) {
    return getMockYouTubeChannel();
  }

  return getMyChannel(userId);
}

export function fetchMyYouTubePlaylists(userId: string) {
  if (isMockYouTubeEnabled()) {
    return getMockYouTubePlaylists();
  }

  return getMyPlaylists(userId);
}

export function fetchYouTubePlaylistVideos(userId: string, playlistId: string) {
  if (isMockYouTubeEnabled()) {
    return getMockYouTubePlaylistVideos(playlistId);
  }

  return getPlaylistVideos(userId, playlistId);
}

export function searchYouTubeVideos(userId: string, query: string, options: YouTubeSearchOptions) {
  if (isMockYouTubeEnabled()) {
    return searchMockYouTubeVideos(query, options.maxResults);
  }

  return searchVideos(userId, query, options);
}
