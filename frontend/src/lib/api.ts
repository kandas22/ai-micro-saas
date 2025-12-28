/**
 * Axios instance configured for the Flask API.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { AuthTokens, ApiError } from "@/types";

/**
 * Get the API base URL dynamically.
 * In browser: uses the current origin with /api/v1 path (works with nginx proxy)
 * In SSR: uses the environment variable or localhost
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use the same origin (nginx proxies /api to backend)
    const origin = window.location.origin;
    return `${origin}/api/v1`;
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
}

// Create axios instance without baseURL - we'll set it dynamically
export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to set baseURL dynamically
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Set baseURL dynamically on each request
    config.baseURL = getApiBaseUrl();
    return config;
  }
);

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Token management
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  },

  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Request interceptor to add auth header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // If unauthorized and we have a refresh token, try to refresh
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      originalRequest
    ) {
      const refreshToken = tokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post<AuthTokens>(
            `${getApiBaseUrl()}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            }
          );

          tokenStorage.setTokens(response.data);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          tokenStorage.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
