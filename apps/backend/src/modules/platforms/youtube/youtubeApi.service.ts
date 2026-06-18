import type { ConnectedAccount } from "@prisma/client";
import { ContentType, Platform, PlaybackType } from "@prisma/client";
import { google, youtube_v3 } from "googleapis";
import { env } from "../../../config/env.js";
import { prisma } from "../../../lib/prisma.js";
import { ApiError } from "../../../utils/apiError.js";

export type YouTubeSearchOptions = {
  maxResults?: number;
  pageToken?: string;
};

function createOAuthClient() {
  return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
}

function isTokenExpired(tokenExpiry: Date | null) {
  if (!tokenExpiry) {
    return true;
  }

  return tokenExpiry.getTime() <= Date.now() + 60_000;
}

function getThumbnailUrl(thumbnails?: youtube_v3.Schema$ThumbnailDetails) {
  return thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url ?? null;
}

function toUnifiedVideoContent(item: {
  videoId: string;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  creatorName?: string | null;
}) {
  return {
    platform: Platform.YOUTUBE,
    contentType: ContentType.VIDEO,
    externalContentId: item.videoId,
    title: item.title ?? "Untitled video",
    description: item.description ?? null,
    thumbnailUrl: item.thumbnailUrl ?? null,
    creatorName: item.creatorName ?? null,
    duration: null,
    sourceUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
    playbackType: PlaybackType.EMBEDDED_PLAYER
  };
}

function handleYouTubeApiError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  throw new ApiError(502, "YouTube API request failed. Please try again.");
}

async function getYouTubeConnection(userId: string) {
  const connectedAccount = await prisma.connectedAccount.findFirst({
    where: {
      userId,
      platform: Platform.YOUTUBE
    }
  });

  if (!connectedAccount) {
    throw new ApiError(404, "YouTube account is not connected.");
  }

  return connectedAccount;
}

export async function refreshAccessTokenIfNeeded(connectedAccount: ConnectedAccount) {
  if (!isTokenExpired(connectedAccount.tokenExpiry)) {
    return connectedAccount;
  }

  if (!connectedAccount.refreshToken) {
    throw new ApiError(401, "YouTube account needs to be reconnected.");
  }

  try {
    const oauthClient = createOAuthClient();
    oauthClient.setCredentials({
      access_token: connectedAccount.accessToken,
      refresh_token: connectedAccount.refreshToken,
      expiry_date: connectedAccount.tokenExpiry?.getTime()
    });

    const { credentials } = await oauthClient.refreshAccessToken();

    if (!credentials.access_token) {
      throw new ApiError(401, "YouTube account needs to be reconnected.");
    }

    return prisma.connectedAccount.update({
      where: { id: connectedAccount.id },
      data: {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token ?? connectedAccount.refreshToken,
        tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : connectedAccount.tokenExpiry,
        scope: credentials.scope ?? connectedAccount.scope
      }
    });
  } catch (error) {
    handleYouTubeApiError(error);
  }
}

async function getAuthenticatedYouTubeClient(userId: string) {
  const connectedAccount = await refreshAccessTokenIfNeeded(await getYouTubeConnection(userId));
  const oauthClient = createOAuthClient();

  oauthClient.setCredentials({
    access_token: connectedAccount.accessToken,
    refresh_token: connectedAccount.refreshToken ?? undefined,
    expiry_date: connectedAccount.tokenExpiry?.getTime()
  });

  return google.youtube({ version: "v3", auth: oauthClient });
}

export async function getMyChannel(userId: string) {
  try {
    const youtube = await getAuthenticatedYouTubeClient(userId);
    const response = await youtube.channels.list({
      part: ["id", "snippet"],
      mine: true
    });

    const channel = response.data.items?.[0];

    if (!channel?.id) {
      throw new ApiError(404, "No YouTube channel found for this account.");
    }

    return {
      id: channel.id,
      title: channel.snippet?.title ?? null,
      description: channel.snippet?.description ?? null,
      thumbnailUrl: getThumbnailUrl(channel.snippet?.thumbnails),
      customUrl: channel.snippet?.customUrl ?? null
    };
  } catch (error) {
    handleYouTubeApiError(error);
  }
}

export async function getMyPlaylists(userId: string) {
  try {
    const youtube = await getAuthenticatedYouTubeClient(userId);
    const response = await youtube.playlists.list({
      part: ["id", "snippet", "contentDetails"],
      mine: true,
      maxResults: 25
    });

    return (
      response.data.items?.map((playlist) => ({
        id: playlist.id ?? "",
        title: playlist.snippet?.title ?? "Untitled playlist",
        description: playlist.snippet?.description ?? null,
        thumbnailUrl: getThumbnailUrl(playlist.snippet?.thumbnails),
        itemCount: playlist.contentDetails?.itemCount ?? 0
      })) ?? []
    ).filter((playlist) => playlist.id);
  } catch (error) {
    handleYouTubeApiError(error);
  }
}

export async function getPlaylistVideos(userId: string, playlistId: string) {
  try {
    const youtube = await getAuthenticatedYouTubeClient(userId);
    const response = await youtube.playlistItems.list({
      part: ["snippet", "contentDetails"],
      playlistId,
      maxResults: 25
    });

    return (
      response.data.items?.map((item) => {
        const videoId = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId;

        if (!videoId) {
          return null;
        }

        return toUnifiedVideoContent({
          videoId,
          title: item.snippet?.title,
          description: item.snippet?.description,
          thumbnailUrl: getThumbnailUrl(item.snippet?.thumbnails),
          creatorName: item.snippet?.videoOwnerChannelTitle ?? item.snippet?.channelTitle
        });
      }) ?? []
    ).filter((item): item is NonNullable<typeof item> => item !== null);
  } catch (error) {
    handleYouTubeApiError(error);
  }
}

export async function searchVideos(userId: string, query: string, options: YouTubeSearchOptions = {}) {
  try {
    const youtube = await getAuthenticatedYouTubeClient(userId);
    const response = await youtube.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      maxResults: options.maxResults ?? 10,
      pageToken: options.pageToken
    });

    const items = (
      response.data.items?.map((item) => {
        const videoId = item.id?.videoId;

        if (!videoId) {
          return null;
        }

        return toUnifiedVideoContent({
          videoId,
          title: item.snippet?.title,
          description: item.snippet?.description,
          thumbnailUrl: getThumbnailUrl(item.snippet?.thumbnails),
          creatorName: item.snippet?.channelTitle
        });
      }) ?? []
    ).filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      items,
      nextPageToken: response.data.nextPageToken ?? null
    };
  } catch (error) {
    handleYouTubeApiError(error);
  }
}
