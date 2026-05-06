"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

// Calls /api/auth/refresh — sets new httpOnly cookies server-side and returns success flag.
// The proxy reads the new gymtality_at cookie on the next request automatically.
async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiFetch<T>(url: string, options?: RequestInit, retried = false): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    if (!retried) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiFetch<T>(url, options, true);
      }
    }

    const user = useAuthStore.getState().user;
    if (user?.role !== "GUEST") {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data as T;
}

async function apiFetchWithMeta<T>(url: string, options?: RequestInit, retried = false): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    if (!retried) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return apiFetchWithMeta<T>(url, options, true);
      }
    }

    const user = useAuthStore.getState().user;
    if (user?.role !== "GUEST") {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return { data: json.data as T, meta: json.meta };
}

export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<Record<string, unknown> | undefined>(undefined);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    apiFetchWithMeta<T>(url)
      .then(({ data: d, meta: m }) => { setData(d); setMeta(m); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, meta, loading, error, refetch };
}

export function useMutation<T, B = unknown>(url: string, method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (body?: B): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFetch<T>(url, {
          method,
          body: body ? JSON.stringify(body) : undefined,
        });
        return result;
      } catch (e: any) {
        setError(e.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  return { mutate, loading, error };
}

export { apiFetch };
