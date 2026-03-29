"use client";

// getCurrentUser is now client-only — reads from Zustand persisted state
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("gymtality-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user ?? null;
  } catch {
    return null;
  }
}

export function requireRole(userRole: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Unauthorized: insufficient permissions");
  }
}
