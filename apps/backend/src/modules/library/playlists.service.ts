import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { upsertContentItem } from "./contentItem.service.js";
import type { ContentItemInput } from "./library.validation.js";

type CreatePlaylistInput = {
  name: string;
  description?: string | null;
};

type UpdatePlaylistInput = Partial<CreatePlaylistInput>;

async function findUserPlaylistOrThrow(userId: string, playlistId: string) {
  const playlist = await prisma.playlist.findFirst({
    where: {
      id: playlistId,
      userId
    }
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  return playlist;
}

export function createLocalPlaylist(userId: string, input: CreatePlaylistInput) {
  return prisma.playlist.create({
    data: {
      userId,
      name: input.name,
      description: input.description ?? null
    }
  });
}

export function listLocalPlaylists(userId: string) {
  return prisma.playlist.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          contentItem: true
        },
        orderBy: {
          addedAt: "desc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getLocalPlaylist(userId: string, playlistId: string) {
  const playlist = await prisma.playlist.findFirst({
    where: {
      id: playlistId,
      userId
    },
    include: {
      items: {
        include: {
          contentItem: true
        },
        orderBy: {
          addedAt: "desc"
        }
      }
    }
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  return playlist;
}

export async function updateLocalPlaylist(userId: string, playlistId: string, input: UpdatePlaylistInput) {
  await findUserPlaylistOrThrow(userId, playlistId);

  return prisma.playlist.update({
    where: {
      id: playlistId
    },
    data: {
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.description === undefined ? {} : { description: input.description ?? null })
    }
  });
}

export async function deleteLocalPlaylist(userId: string, playlistId: string) {
  await findUserPlaylistOrThrow(userId, playlistId);

  await prisma.playlist.delete({
    where: {
      id: playlistId
    }
  });
}

export async function addItemToPlaylist(userId: string, playlistId: string, contentItemInput: ContentItemInput) {
  const playlist = await findUserPlaylistOrThrow(userId, playlistId);
  const contentItem = await upsertContentItem(contentItemInput);

  return prisma.playlistItem.upsert({
    where: {
      playlistId_contentItemId: {
        playlistId: playlist.id,
        contentItemId: contentItem.id
      }
    },
    update: {},
    create: {
      playlistId: playlist.id,
      contentItemId: contentItem.id
    },
    include: {
      contentItem: true
    }
  });
}

export async function removeItemFromPlaylist(userId: string, playlistId: string, contentItemId: string) {
  const playlist = await findUserPlaylistOrThrow(userId, playlistId);

  await prisma.playlistItem.deleteMany({
    where: {
      playlistId: playlist.id,
      contentItemId
    }
  });
}
