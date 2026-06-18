import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth";
import type { ContentItem } from "../types/content";

export type SearchContentParams = {
  q: string;
  platform?: string;
  contentType?: string;
  maxResults?: number;
  pageToken?: string;
};

export type SearchContentResponse = {
  items: ContentItem[];
  nextPageToken?: string | null;
};

export async function searchContent(params: SearchContentParams) {
  const response = await apiClient.get<ApiResponse<SearchContentResponse>>("/search", {
    params
  });

  return response.data.data;
}
