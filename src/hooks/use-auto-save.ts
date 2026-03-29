"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoSaveOptions {
  data: Record<string, unknown>;
  onSave: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ data, onSave, delay = 3000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialDataRef = useRef<string>("");
  const isMountedRef = useRef(false);

  // Store initial data on first render
  useEffect(() => {
    if (!isMountedRef.current) {
      initialDataRef.current = JSON.stringify(data);
      isMountedRef.current = true;
    }
  }, [data]);

  const cancelAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isMountedRef.current) return;

    const currentData = JSON.stringify(data);
    if (currentData === initialDataRef.current) return;

    cancelAutoSave();

    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave();
        initialDataRef.current = currentData;
      } catch {
        // Silent fail — user can manually save
      }
    }, delay);

    return cancelAutoSave;
  }, [data, onSave, delay, enabled, cancelAutoSave]);

  return { cancelAutoSave };
}
