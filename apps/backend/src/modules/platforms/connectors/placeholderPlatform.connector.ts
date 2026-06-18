import type { ConnectedAccount, Platform } from "@prisma/client";
import {
  PlatformConnector,
  PlatformConnectInput,
  PlatformPlaybackInput,
  PlatformPlaylistInput,
  PlatformPlaylistItemsInput,
  PlatformProfileInput,
  PlatformSearchInput,
  UnsupportedPlatformResponse,
  UNSUPPORTED_PLATFORM_MESSAGE
} from "./platformConnector.js";

function unsupportedPlatformResponse(): UnsupportedPlatformResponse {
  return { message: UNSUPPORTED_PLATFORM_MESSAGE };
}

export class PlaceholderPlatformConnector implements PlatformConnector {
  constructor(public readonly platform: Platform) {}

  async connect(_input: PlatformConnectInput) {
    return unsupportedPlatformResponse();
  }

  async refreshToken(_connectedAccount: ConnectedAccount) {
    return unsupportedPlatformResponse();
  }

  async getProfile(_input: PlatformProfileInput) {
    return unsupportedPlatformResponse();
  }

  async search(_input: PlatformSearchInput) {
    return unsupportedPlatformResponse();
  }

  async getPlaylists(_input: PlatformPlaylistInput) {
    return unsupportedPlatformResponse();
  }

  async getPlaylistItems(_input: PlatformPlaylistItemsInput) {
    return unsupportedPlatformResponse();
  }

  async getPlaybackInfo(_input: PlatformPlaybackInput) {
    return unsupportedPlatformResponse();
  }
}
