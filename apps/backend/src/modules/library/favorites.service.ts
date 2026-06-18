import { prisma } from "../../lib/prisma.js";
import type { ContentItemInput } from "./library.validation.js";
import { upsertContentItem } from "./contentItem.service.js";

export async function createFavorite(userId: string, contentItemInput: ContentItemInput) {
  const contentItem = await upsertContentItem(contentItemInput);

  return prisma.favorite.upsert({
    where: {
      userId_contentItemId: {
        userId,
        contentItemId: contentItem.id
      }
    },
    update: {},
    create: {
      userId,
      contentItemId: contentItem.id
    },
    include: {
      contentItem: true
    }
  });
}

export function listFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      contentItem: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function deleteFavorite(userId: string, contentItemId: string) {
  await prisma.favorite.deleteMany({
    where: {
      userId,
      contentItemId
    }
  });
}
