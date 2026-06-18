import { ContentType, Platform, Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { searchYouTubeVideos } from "../youtube/youtube.service.js";
import type { SearchQueryInput } from "./search.validation.js";

function buildHistoryFilters(input: SearchQueryInput): Prisma.InputJsonObject {
  return {
    platform: input.platform ?? Platform.YOUTUBE,
    contentType: input.contentType ?? ContentType.VIDEO,
    duration: input.duration ?? null,
    sort: input.sort ?? null,
    language: input.language ?? null,
    category: input.category ?? null,
    maxResults: input.maxResults,
    pageToken: input.pageToken ?? null
  };
}

async function saveSearchHistory(userId: string, input: SearchQueryInput) {
  await prisma.searchHistory.create({
    data: {
      userId,
      query: input.q,
      filtersJson: buildHistoryFilters(input)
    }
  });
}

export async function unifiedSearch(userId: string, input: SearchQueryInput) {
  const platform = input.platform ?? Platform.YOUTUBE;
  const contentType = input.contentType ?? ContentType.VIDEO;

  if (platform !== Platform.YOUTUBE) {
    throw new ApiError(400, "This platform is not supported in MVP yet.");
  }

  if (contentType !== ContentType.VIDEO) {
    throw new ApiError(400, "Only YouTube video search is supported in MVP.");
  }

  const result = await searchYouTubeVideos(userId, input.q, {
    maxResults: input.maxResults,
    pageToken: input.pageToken
  });

  await saveSearchHistory(userId, input);

  return result;
}

export async function getUserSearchHistory(userId: string) {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      query: true,
      filtersJson: true,
      createdAt: true
    }
  });
}

export async function clearUserSearchHistory(userId: string) {
  await prisma.searchHistory.deleteMany({
    where: { userId }
  });
}
