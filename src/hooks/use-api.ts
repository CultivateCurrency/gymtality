"use client";

import { useState, useEffect, useCallback } from "react";
import type { ApiResponse } from "@/types";

// Generic fetch wrapper that handles the { success, data, error } pattern
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error || "Request failed");
  return json.data as T;
}

// GET hook with loading/error state
export function useApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    apiFetch<T>(url)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// Mutation helper (POST/PUT/DELETE)
export function useMutation<T, B = unknown>(url: string, method: "POST" | "PUT" | "DELETE" = "POST") {
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
