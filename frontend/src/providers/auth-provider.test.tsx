import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth-provider";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock auth API
vi.mock("@/lib/auth", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

// Mock token storage
vi.mock("@/lib/api", () => ({
  tokenStorage: {
    getAccessToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

import { authApi } from "@/lib/auth";
import { tokenStorage } from "@/lib/api";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (tokenStorage.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it("throws error when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");
  });

  it("completes loading after mount", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // After loading, user should be null if no token
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("checks for existing token on mount", async () => {
    const mockUser = { id: 1, email: "test@example.com", full_name: "Test User" };
    (tokenStorage.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue("valid-token");
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(authApi.getCurrentUser).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("clears tokens when getCurrentUser fails", async () => {
    (tokenStorage.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue("invalid-token");
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Invalid token"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(tokenStorage.clearTokens).toHaveBeenCalled();
    expect(result.current.user).toBe(null);
  });

  it("handles login successfully", async () => {
    const mockUser = { id: 1, email: "test@example.com", full_name: "Test User" };
    const mockResponse = { user: mockUser, access_token: "token" };
    (authApi.login as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login({ email: "test@example.com", password: "password" });
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });
    expect(result.current.user).toEqual(mockUser);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("handles register successfully", async () => {
    const mockUser = { id: 1, email: "new@example.com", full_name: "New User" };
    const mockResponse = { user: mockUser, access_token: "token" };
    (authApi.register as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        email: "new@example.com",
        password: "password",
        full_name: "New User",
      });
    });

    expect(authApi.register).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password",
      full_name: "New User",
    });
    expect(result.current.user).toEqual(mockUser);
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("handles logout", async () => {
    const mockUser = { id: 1, email: "test@example.com", full_name: "Test User" };
    (tokenStorage.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue("token");
    (authApi.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);
    (authApi.logout as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("login throws on API error", async () => {
    (authApi.login as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Invalid credentials")
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.login({ email: "test@example.com", password: "wrong" });
      })
    ).rejects.toThrow("Invalid credentials");
  });
});
