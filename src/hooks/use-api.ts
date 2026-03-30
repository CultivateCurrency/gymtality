"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  // Read from zustand-persisted localStorage key
  try {
    const raw = localStorage.getItem("gymtality-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
  const token = getToken();

  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    // Only redirect if user has a real (non-guest) session
    try {
      const raw = localStorage.getItem("gymtality-auth");
      const parsed = raw ? JSON.parse(raw) : null;
      const isGuest = parsed?.state?.user?.role === "GUEST";
      if (!isGuest) {
        localStorage.removeItem("gymtality-auth");
        document.cookie = "gymtality_auth=; path=/; max-age=0";
        document.cookie = "gymtality_role=; path=/; max-age=0";
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data as T;
}

async function apiFetchWithMeta<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
  const token = getToken();

  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    try {
      const raw = localStorage.getItem("gymtality-auth");
      const parsed = raw ? JSON.parse(raw) : null;
      const isGuest = parsed?.state?.user?.role === "GUEST";
      if (!isGuest) {
        localStorage.removeItem("gymtality-auth");
        document.cookie = "gymtality_auth=; path=/; max-age=0";
        document.cookie = "gymtality_role=; path=/; max-age=0";
        window.location.href = "/login";
      }
    } catch {
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
