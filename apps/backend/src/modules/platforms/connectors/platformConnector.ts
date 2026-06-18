import type { ConnectedAccount, Platform } from "@prisma/client";

export const UNSUPPORTED_PLATFORM_MESSAGE =
  "Official API access or playback SDK is required before enabling this platform.";

export type UnsupportedPlatformResponse = {
  message: typeof UNSUPPORTED_PLATFORM_MESSAGE;
};

export type PlatformConnectInput = {
  userId?: string;
  state?: string;
  code?: string;
};

export type PlatformProfileInput = {
  userId: string;
};

export type PlatformSearchInput = {
  userId: string;
  query: string;
  filters?: {
    maxResults?: number;
    pageToken?: string;
    order?: "date" | "rating" | "relevance" | "title" | "videoCount" | "viewCount";
    duration?: "any" | "short" | "medium" | "long";
    language?: string;
    category?: string;
  };
};

export type PlatformPlaylistInput = {
  userId: string;
};

export type PlatformPlaylistItemsInput = {
  userId: string;
  playlistId: string;
};

export type PlatformPlaybackInput = {
  userId?: string;
  externalContentId: string;
};

export interface PlatformConnector {
  platform: Platform;
  connect(input: PlatformConnectInput): Promise<unknown>;
  refreshToken(connectedAccount: ConnectedAccount): Promise<ConnectedAccount | UnsupportedPlatformResponse>;
  getProfile(input: PlatformProfileInput): Promise<unknown>;
  search(input: PlatformSearchInput): Promise<unknown>;
  getPlaylists(input: PlatformPlaylistInput): Promise<unknown>;
  getPlaylistItems(input: PlatformPlaylistItemsInput): Promise<unknown>;
  getPlaybackInfo(input: PlatformPlaybackInput): Promise<unknown>;
}

export function isUnsupportedPlatformResponse(value: unknown): value is UnsupportedPlatformResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    value.message === UNSUPPORTED_PLATFORM_MESSAGE
  );
}
