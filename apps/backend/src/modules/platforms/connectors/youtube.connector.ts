import { Platform, PlaybackType } from "@prisma/client";
import type { ConnectedAccount } from "@prisma/client";
import { ApiError } from "../../../utils/apiError.js";
import {
  exchangeYouTubeOAuthCode,
  fetchYouTubeAccountInfo,
  generateYouTubeOAuthUrl
} from "../youtube/youtubeOAuth.service.js";
import {
  getMyChannel,
  getMyPlaylists,
  getPlaylistVideos,
  refreshAccessTokenIfNeeded,
  searchVideos
} from "../youtube/youtubeApi.service.js";
import type {
  PlatformConnectInput,
  PlatformConnector,
  PlatformPlaybackInput,
  PlatformPlaylistInput,
  PlatformPlaylistItemsInput,
  PlatformProfileInput,
  PlatformSearchInput
} from "./platformConnector.js";

export class YouTubeConnector implements PlatformConnector {
  readonly platform = Platform.YOUTUBE;

  async connect(input: PlatformConnectInput) {
    if (input.code) {
      const tokens = await exchangeYouTubeOAuthCode(input.code);
      const account = await fetchYouTubeAccountInfo(tokens);

      return { tokens, account };
    }

    if (input.state) {
      return { url: generateYouTubeOAuthUrl(input.state) };
    }

    throw new ApiError(400, "YouTube connection requires an OAuth state or callback code.");
  }

  async refreshToken(connectedAccount: ConnectedAccount) {
    return refreshAccessTokenIfNeeded(connectedAccount);
  }

  async getProfile(input: PlatformProfileInput) {
    return getMyChannel(input.userId);
  }

  async search(input: PlatformSearchInput) {
    return searchVideos(input.userId, input.query, input.filters);
  }

  async getPlaylists(input: PlatformPlaylistInput) {
    return getMyPlaylists(input.userId);
  }

  async getPlaylistItems(input: PlatformPlaylistItemsInput) {
    return getPlaylistVideos(input.userId, input.playlistId);
  }

  async getPlaybackInfo(input: PlatformPlaybackInput) {
    return {
      platform: Platform.YOUTUBE,
      externalContentId: input.externalContentId,
      playbackType: PlaybackType.EMBEDDED_PLAYER,
      embedUrl: `https://www.youtube.com/embed/${input.externalContentId}`,
      sourceUrl: `https://www.youtube.com/watch?v=${input.externalContentId}`
    };
  }
}

export const youtubeConnector = new YouTubeConnector();
