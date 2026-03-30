"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  username: string;
  role: string;
  profilePhoto: string | null;
  tenantId: string;
}

interface AuthStore {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  pendingEmail: string | null;

  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setPendingEmail: (email: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      pendingEmail: null,

      login: (user, accessToken, refreshToken) => {
        // Set a cookie so Next.js middleware can check auth without reading localStorage
        if (typeof document !== "undefined") {
          document.cookie = `gymtality_auth=1; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`;
          document.cookie = `gymtality_role=${user.role}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 30}`;
        }
        set({ user, accessToken, refreshToken });
      },

      loginAsGuest: () => {
        if (typeof document !== "undefined") {
          document.cookie = `gymtality_auth=1; path=/; SameSite=Lax; max-age=${60 * 60 * 2}`;
          document.cookie = `gymtality_role=GUEST; path=/; SameSite=Lax; max-age=${60 * 60 * 2}`;
        }
        set({
          user: {
            id: "guest",
            email: "",
            fullName: "Guest",
            username: "guest",
            role: "GUEST",
            profilePhoto: null,
            tenantId: "",
          },
          accessToken: null,
          refreshToken: null,
        });
      },

      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = "gymtality_auth=; path=/; max-age=0";
          document.cookie = "gymtality_role=; path=/; max-age=0";
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },

      setTokens: (accessToken, refreshToken) =>
        set((s) => ({ accessToken, refreshToken: refreshToken ?? s.refreshToken })),

      setPendingEmail: (email) => set({ pendingEmail: email }),
    }),
    {
      name: "gymtality-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        pendingEmail: s.pendingEmail,
      }),
    }
  )
);
