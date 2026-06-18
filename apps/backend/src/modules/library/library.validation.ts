import { ContentType, Platform, PlaybackType } from "@prisma/client";
import { z } from "zod";

export const contentItemInputSchema = z.object({
  platform: z.nativeEnum(Platform),
  contentType: z.nativeEnum(ContentType),
  externalContentId: z.string().trim().min(1, "externalContentId is required."),
  title: z.string().trim().min(1, "title is required."),
  description: z.string().trim().nullable().optional(),
  thumbnailUrl: z.string().trim().nullable().optional(),
  creatorName: z.string().trim().nullable().optional(),
  duration: z.number().int().nonnegative().nullable().optional(),
  sourceUrl: z.string().trim().url("sourceUrl must be a valid URL."),
  playbackType: z.nativeEnum(PlaybackType)
});

export const createPlaylistSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional().nullable()
});

export const updatePlaylistSchema = createPlaylistSchema.partial().refine((input) => input.name !== undefined || input.description !== undefined, {
  message: "At least one playlist field is required."
});

export const progressSchema = z.object({
  progressSeconds: z.number().int().nonnegative().default(0)
});

export const contentItemBodySchema = z.object({
  contentItem: contentItemInputSchema
});

export const watchHistoryBodySchema = z.object({
  contentItem: contentItemInputSchema,
  progressSeconds: z.number().int().nonnegative().default(0)
});

export type ContentItemInput = z.infer<typeof contentItemInputSchema>;
export type ContentItemBodyInput = z.infer<typeof contentItemBodySchema>;
export type WatchHistoryBodyInput = z.infer<typeof watchHistoryBodySchema>;
