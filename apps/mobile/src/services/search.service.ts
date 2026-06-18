import { api as apiClient } from "./api";
import type { ApiEnvelope, UnifiedContentItem } from "../types";

export async function searchContent(params: {
  q: string;
  platform?: string;
  contentType?: string;
  duration?: string;
  sort?: string;
}) {
  const response = await apiClient.get<ApiEnvelope<{ items: UnifiedContentItem[] }>>("/api/v1/search", {
    params
  });

  return response.data.data.items;
}
