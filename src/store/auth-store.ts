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
  pendingEmail: string | null;

  login: (user: AuthUser) => void;
  loginAsGuest: () => void;
  logout: () => void;
  setPendingEmail: (email: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      pendingEmail: null,

      login: (user) => {
        // Cookies (at, rt, session, role) are set server-side by /api/auth/login
        set({ user });
      },

      loginAsGuest: () => {
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
        });
      },

      logout: async () => {
        // Clear httpOnly cookies server-side and revoke refresh tokens in DB
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        set({ user: null });
      },

      setPendingEmail: (email) => set({ pendingEmail: email }),
    }),
    {
      name: "gymtality-auth",
      partialize: (s) => ({
        user: s.user,
        pendingEmail: s.pendingEmail,
      }),
    }
  )
);
