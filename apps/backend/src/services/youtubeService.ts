import { google } from "googleapis";
import { env } from "../config/env.js";

export const youtube = google.youtube({
  version: "v3",
  auth: env.YOUTUBE_API_KEY
});

export function normalizeVideo(item: {
  id?: { videoId?: string | null } | string | null;
  snippet?: {
    title?: string | null;
    channelTitle?: string | null;
    publishedAt?: string | null;
    description?: string | null;
    thumbnails?: { medium?: { url?: string | null }; default?: { url?: string | null } };
  } | null;
}) {
  const id = typeof item.id === "string" ? item.id : item.id?.videoId;
  const snippet = item.snippet;

  return {
    id: id ?? "",
    title: snippet?.title ?? "Untitled video",
    channelTitle: snippet?.channelTitle ?? "Unknown channel",
    thumbnailUrl: snippet?.thumbnails?.medium?.url ?? snippet?.thumbnails?.default?.url ?? "",
    publishedAt: snippet?.publishedAt ?? "",
    description: snippet?.description ?? ""
  };
}
