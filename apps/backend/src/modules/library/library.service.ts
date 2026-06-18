import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import type { ContentItemInput } from "./library.validation.js";

function normalizeDurationSeconds(duration: ContentItemInput["duration"]) {
  if (typeof duration === "number") {
    return duration;
  }

  return null;
}

export async function upsertContentItem(input: ContentItemInput) {
  return prisma.contentItem.upsert({
    where: {
      platform_externalContentId: {
        platform: input.platform,
        externalContentId: input.externalContentId
      }
    },
    update: {
      title: input.title,
      description: input.description,
      thumbnailUrl: input.thumbnailUrl,
      creatorName: input.creatorName,
      duration: normalizeDurationSeconds(input.duration),
      contentType: input.contentType,
      sourceUrl: input.sourceUrl,
      playbackType: input.playbackType
    },
    create: {
      platform: input.platform,
      externalContentId: input.externalContentId,
      title: input.title,
      description: input.description,
      thumbnailUrl: input.thumbnailUrl,
      creatorName: input.creatorName,
      duration: normalizeDurationSeconds(input.duration),
      contentType: input.contentType,
      sourceUrl: input.sourceUrl,
      playbackType: input.playbackType
    }
  });
}

export function includeContentItem() {
  return { contentItem: true } satisfies Prisma.FavoriteInclude;
}

export async function findUserPlaylistOrThrow(userId: string, playlistId: string) {
  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, userId }
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  return playlist;
}
