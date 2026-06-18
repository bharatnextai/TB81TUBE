import { prisma } from "../../lib/prisma.js";
import type { ContentItemInput } from "./library.validation.js";

export async function upsertContentItem(contentItem: ContentItemInput) {
  return prisma.contentItem.upsert({
    where: {
      platform_externalContentId: {
        platform: contentItem.platform,
        externalContentId: contentItem.externalContentId
      }
    },
    update: {
      title: contentItem.title,
      description: contentItem.description ?? null,
      thumbnailUrl: contentItem.thumbnailUrl ?? null,
      creatorName: contentItem.creatorName ?? null,
      duration: contentItem.duration ?? null,
      contentType: contentItem.contentType,
      sourceUrl: contentItem.sourceUrl,
      playbackType: contentItem.playbackType
    },
    create: {
      platform: contentItem.platform,
      externalContentId: contentItem.externalContentId,
      title: contentItem.title,
      description: contentItem.description ?? null,
      thumbnailUrl: contentItem.thumbnailUrl ?? null,
      creatorName: contentItem.creatorName ?? null,
      duration: contentItem.duration ?? null,
      contentType: contentItem.contentType,
      sourceUrl: contentItem.sourceUrl,
      playbackType: contentItem.playbackType
    }
  });
}
