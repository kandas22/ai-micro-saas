/**
 * Authentication API functions.
 */

import api, { tokenStorage } from "./api";
import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "@/types";

export const authApi = {
  /**
   * Register a new user.
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", credentials);
    tokenStorage.setTokens(response.data);
    return response.data;
  },

  /**
   * Login an existing user.
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    tokenStorage.setTokens(response.data);
    return response.data;
  },

  /**
   * Logout the current user.
   */
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      tokenStorage.clearTokens();
    }
  },

  /**
   * Get the current authenticated user.
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  /**
   * Check if user is authenticated (has valid token).
   */
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};

export default authApi;
