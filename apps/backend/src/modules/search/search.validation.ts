import { ContentType, Platform } from "@prisma/client";
import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required."),
  platform: z.nativeEnum(Platform).optional(),
  contentType: z.nativeEnum(ContentType).optional(),
  duration: z.enum(["any", "short", "medium", "long"]).optional(),
  sort: z.enum(["date", "rating", "relevance", "title", "videoCount", "viewCount"]).optional(),
  language: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  maxResults: z.coerce.number().int().min(1).max(25).optional().default(10),
  pageToken: z.string().trim().min(1).optional()
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
