"use client";

/**
 * useStreak — data hook for the member workout-streak endpoint.
 *
 * Why this exists as a dedicated hook (vs. inlining useApi):
 *   - The endpoint requires an X-Timezone header. useApi doesn't expose
 *     headers; this hook owns the fetch directly so the header flows through.
 *   - The shape needs a typed contract; consumers shouldn't be passing the
 *     raw useApi<unknown> result around.
 *   - Empty state (zero sessions) is a distinct render branch from loading.
 *     Surfaced here as `isEmpty` so components don't have to derive it.
 *
 * SSR safety: the timezone lookup runs in a useEffect, not at module load,
 * because `Intl.DateTimeFormat().resolvedOptions().timeZone` is a browser
 * concept. SSR / RSC renders show loading; the client hydrates with the
 * real value on mount.
 *
 * Single-instance caching: the backend caches per (userId, tz) for 5min,
 * so a second component mounting in the same minute is essentially free
 * (one network roundtrip, no DB hit).
 */
import { useCallback, useEffect, useState } from "react";

/** Wire-format payload from GET /api/users/me/streak. Mirrors backend exactly. */
export interface StreakData {
  current: number;
  longest: number;
  todayLogged: boolean;
  lastActiveDate: string | null; // YYYY-MM-DD in the user's tz, or null
  timezone: string;
}

export interface UseStreakResult {
  /** The streak payload, or null while loading / on error. */
  data: StreakData | null;
  /** True from first render until the first response arrives. */
  loading: boolean;
  /** Error message string, or null. Surface this in error states. */
  error: string | null;
  /**
   * True when the request succeeded AND the user has no streak history yet
   * (current === 0 && longest === 0). Distinct from loading — the empty
   * state should show a CTA, not a skeleton.
   */
  isEmpty: boolean;
  /** Refetch on demand (e.g. after a workout completion). */
  refetch: () => void;
}

/**
 * Detect the user's IANA timezone using the browser's Intl API. Returns
 * "UTC" during SSR or if the platform doesn't expose resolvedOptions
 * (vanishingly rare on supported browsers).
 */
function detectTimezone(): string {
  if (typeof window === "undefined") return "UTC";
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function useStreak(): UseStreakResult {
  const [tz, setTz] = useState<string>("UTC");
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Detect tz on mount only — never re-detect mid-session.
  useEffect(() => {
    setTz(detectTimezone());
  }, []);

  const fetchStreak = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users/me/streak", {
          headers: { "X-Timezone": tz },
          signal,
        });

        if (res.status === 401) {
          // Auth expired. Don't show as a streak error — the page-level
          // auth handler will catch it via a separate refresh cycle.
          // Surface the loading state as resolved-empty so the UI doesn't
          // spin forever, but DON'T set data (we don't have any).
          setLoading(false);
          return;
        }

        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error ?? "Failed to load streak");
        }
        setData(json.data as StreakData);
      } catch (err) {
        // AbortError = the effect cleanup fired (component unmounted or
        // dependencies changed). Don't surface it as a real error.
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load streak");
      } finally {
        setLoading(false);
      }
    },
    [tz]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchStreak(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchStreak]);

  const refetch = useCallback(() => {
    const ctrl = new AbortController();
    void fetchStreak(ctrl.signal);
  }, [fetchStreak]);

  const isEmpty = data !== null && data.current === 0 && data.longest === 0;

  return { data, loading, error, isEmpty, refetch };
}
