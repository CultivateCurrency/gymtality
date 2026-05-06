"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

// On page load: if user data exists in the store (from localStorage), verify the
// session is still active by silently attempting a token refresh. If both tokens
// have expired (user was inactive for 7+ days), the 401 response triggers logout.
export function AuthInitializer() {
  useEffect(() => {
    const { user, logout } = useAuthStore.getState();
    if (!user || user.role === "GUEST") return;

    fetch("/api/auth/refresh", { method: "POST" })
      .then((res) => { if (res.status === 401) logout(); })
      .catch(() => {});
  }, []);

  return null;
}
