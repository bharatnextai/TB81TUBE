import * as WebBrowser from "expo-web-browser";
import { api as apiClient } from "./api";
import type { ApiEnvelope, ConnectedAccount } from "../types";

export async function getConnections() {
  const response = await apiClient.get<ApiEnvelope<{ connections: ConnectedAccount[] }>>("/api/v1/connections");
  return response.data.data.connections;
}

export async function connectYouTube() {
  const response = await apiClient.get<ApiEnvelope<{ url: string }>>("/api/v1/connections/youtube/start");
  await WebBrowser.openBrowserAsync(response.data.data.url);
}

export async function removeConnection(id: string) {
  await apiClient.delete(`/api/v1/connections/${id}`);
}
