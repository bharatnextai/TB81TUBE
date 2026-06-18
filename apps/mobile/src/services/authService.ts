import { apiClient, clearStoredToken, saveStoredToken } from "./apiClient";
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth";

export async function register(name: string, email: string, password: string) {
  const payload: RegisterPayload = { name, email, password };
  const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", payload);

  await saveStoredToken(response.data.data.token);

  return response.data.data;
}

export async function login(email: string, password: string) {
  const payload: LoginPayload = { email, password };
  const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", payload);

  await saveStoredToken(response.data.data.token);

  return response.data.data;
}

export async function getMe() {
  const response = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");

  return response.data.data.user;
}

export async function logout() {
  await clearStoredToken();
}
