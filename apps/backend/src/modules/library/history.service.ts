import { prisma } from "../../lib/prisma.js";
import { upsertContentItem } from "./contentItem.service.js";
import type { ContentItemInput } from "./library.validation.js";

export async function upsertWatchHistory(userId: string, contentItemInput: ContentItemInput, progressSeconds: number) {
  const contentItem = await upsertContentItem(contentItemInput);
  const existingHistory = await prisma.watchHistory.findFirst({
    where: {
      userId,
      contentItemId: contentItem.id
    },
    select: {
      id: true
    }
  });

  if (existingHistory) {
    return prisma.watchHistory.update({
      where: {
        id: existingHistory.id
      },
      data: {
        watchedAt: new Date(),
        progressSeconds
      },
      include: {
        contentItem: true
      }
    });
  }

  return prisma.watchHistory.create({
    data: {
      userId,
      contentItemId: contentItem.id,
      progressSeconds
    },
    include: {
      contentItem: true
    }
  });
}

export function listWatchHistory(userId: string) {
  return prisma.watchHistory.findMany({
    where: { userId },
    include: {
      contentItem: true
    },
    orderBy: {
      watchedAt: "desc"
    },
    take: 100
  });
}

export async function clearWatchHistory(userId: string) {
  await prisma.watchHistory.deleteMany({
    where: { userId }
  });
}
