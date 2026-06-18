import { apiClient } from "./apiClient";
import type { ApiResponse } from "../types/auth";
import type { ConnectedAccountsResponse, YouTubeStartResponse } from "../types/connections";

export async function getConnections() {
  const response = await apiClient.get<ApiResponse<ConnectedAccountsResponse>>("/connections");

  return response.data.data;
}

export async function startYouTubeConnection() {
  const response = await apiClient.get<ApiResponse<YouTubeStartResponse>>("/connections/youtube/start");

  return response.data.data;
}

export async function disconnectAccount(connectionId: string) {
  await apiClient.delete<ApiResponse<null>>(`/connections/${connectionId}`);
}
