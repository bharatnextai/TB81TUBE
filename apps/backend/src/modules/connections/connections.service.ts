import { Platform } from "@prisma/client";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import {
  exchangeYouTubeOAuthCode,
  fetchYouTubeAccountInfo,
  generateYouTubeOAuthUrl
} from "../platforms/youtube/youtubeOAuth.service.js";

type OAuthState = {
  userId: string;
  purpose: "youtube_oauth";
};

type ConnectionForResponse = {
  id: string;
  platform: Platform;
  platformUserId: string;
  scope: string | null;
  createdAt: Date;
};

function serializeConnection(connection: ConnectionForResponse) {
  return {
    id: connection.id,
    platform: connection.platform,
    platformUserId: connection.platformUserId,
    scope: connection.scope,
    createdAt: connection.createdAt
  };
}

function createOAuthState(userId: string) {
  const expiresIn: SignOptions["expiresIn"] = "10m";

  return jwt.sign(
    {
      userId,
      purpose: "youtube_oauth"
    } satisfies OAuthState,
    env.JWT_SECRET,
    { expiresIn }
  );
}

function verifyOAuthState(state: string) {
  try {
    const decoded = jwt.verify(state, env.JWT_SECRET) as OAuthState;

    if (decoded.purpose !== "youtube_oauth" || !decoded.userId) {
      throw new ApiError(400, "Invalid OAuth state.");
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, "Invalid or expired OAuth state.");
  }
}

export async function listConnections(userId: string) {
  const connections = await prisma.connectedAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      platform: true,
      platformUserId: true,
      scope: true,
      createdAt: true
    }
  });

  return connections.map(serializeConnection);
}

export function createYouTubeConnectionUrl(userId: string) {
  const state = createOAuthState(userId);
  return generateYouTubeOAuthUrl(state);
}

export async function connectMockYouTubeAccount(userId: string) {
  const connection = await prisma.connectedAccount.upsert({
    where: {
      userId_platform_platformUserId: {
        userId,
        platform: Platform.YOUTUBE,
        platformUserId: "mock-youtube-user"
      }
    },
    update: {
      accessToken: "dev-mock-access-token",
      refreshToken: "dev-mock-refresh-token",
      tokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
      scope: "mock-youtube-readonly"
    },
    create: {
      userId,
      platform: Platform.YOUTUBE,
      platformUserId: "mock-youtube-user",
      accessToken: "dev-mock-access-token",
      refreshToken: "dev-mock-refresh-token",
      tokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
      scope: "mock-youtube-readonly"
    },
    select: {
      id: true,
      platform: true,
      platformUserId: true,
      scope: true,
      createdAt: true
    }
  });

  return serializeConnection(connection);
}

export async function handleYouTubeCallback(code: string, state: string) {
  const decodedState = verifyOAuthState(state);
  const tokens = await exchangeYouTubeOAuthCode(code);
  const accountInfo = await fetchYouTubeAccountInfo({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });

  // TODO: Encrypt OAuth access and refresh tokens before production release.
  const connection = await prisma.connectedAccount.upsert({
    where: {
      userId_platform_platformUserId: {
        userId: decodedState.userId,
        platform: Platform.YOUTUBE,
        platformUserId: accountInfo.platformUserId
      }
    },
    update: {
      accessToken: tokens.accessToken,
      ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
      tokenExpiry: tokens.expiryDate,
      scope: tokens.scope
    },
    create: {
      userId: decodedState.userId,
      platform: Platform.YOUTUBE,
      platformUserId: accountInfo.platformUserId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiry: tokens.expiryDate,
      scope: tokens.scope
    },
    select: {
      id: true,
      platform: true,
      platformUserId: true,
      scope: true,
      createdAt: true
    }
  });

  return serializeConnection(connection);
}

export async function deleteConnection(userId: string, connectionId: string) {
  const connection = await prisma.connectedAccount.findFirst({
    where: {
      id: connectionId,
      userId
    },
    select: {
      id: true
    }
  });

  if (!connection) {
    throw new ApiError(404, "Connected account not found.");
  }

  await prisma.connectedAccount.delete({
    where: { id: connection.id }
  });
}
