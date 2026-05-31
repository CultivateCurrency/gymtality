"use client";

/**
 * StreakSkeleton — layout-preserving loading placeholder for StreakCard.
 *
 * Shapes match the populated card so when data arrives there's no layout
 * shift (CLS = 0). Separate from the live card so the live card stays
 * loading-state-free and easy to read.
 *
 * Each variant has its own skeleton — they should not be conditional on
 * the same skeleton because the populated layouts differ enough that
 * matching them with conditionals would introduce its own bugs.
 */
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StreakSkeletonProps {
  variant?: "hero" | "compact" | "inline";
  className?: string;
}

export function StreakSkeleton({ variant = "hero", className }: StreakSkeletonProps) {
  if (variant === "inline") {
    return (
      <span
        role="status"
        aria-busy="true"
        aria-label="Loading streak"
        className={cn("inline-flex items-center gap-2", className)}
      >
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading streak"
        className={cn(
          "flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900/40 border border-zinc-800/50",
          className
        )}
      >
        <Skeleton className="h-5 w-5 rounded-full mb-1" />
        <Skeleton className="h-4 w-8" />
      </div>
    );
  }

  // hero
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading streak"
      className={cn(
        "rounded-2xl bg-zinc-900/40 border border-zinc-800/50 p-5",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
}
