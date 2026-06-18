import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/api";

const TOKEN_KEY = "tb81tube.authToken";

export async function getStoredToken() {
  if (await secureStoreAvailable()) {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  return getWebToken();
}

export async function saveStoredToken(token: string) {
  if (await secureStoreAvailable()) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  }

  setWebToken(token);
}

export async function clearStoredToken() {
  if (await secureStoreAvailable()) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }

  deleteWebToken();
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[TB81TUBE API] Request", {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method
    });
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[TB81TUBE API] Error", {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          message: error.message
        });
      }

      if (error.message === "Network Error") {
        return Promise.reject(new Error("Cannot connect to backend. Check that backend is running and API URL is correct."));
      }

      if (error.code === "ECONNABORTED" || error.message.toLowerCase().includes("timeout")) {
        return Promise.reject(new Error("Connection request timed out. Check backend terminal and API URL."));
      }

      const message =
        typeof error.response?.data === "object" &&
        error.response?.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : error.message || "Request failed.";

      return Promise.reject(new Error(message));
    }

    return Promise.reject(new Error("Unexpected network error."));
  }
);

export async function checkApiStatus() {
  const response = await apiClient.get<{ success: boolean; message: string }>("/status");

  return response.data;
}

async function secureStoreAvailable() {
  return SecureStore.isAvailableAsync().catch(() => false);
}

function getWebToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

function setWebToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

function deleteWebToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}
