"use client";

/**
 * StreakFlame — visual flame that reflects streak intensity.
 *
 * Design choices a senior frontend would call out:
 *
 *   1. Tier names (ember → flame → blaze → inferno) instead of numeric
 *      breakpoints. Product can tune the boundaries without changing the
 *      visual contract. Designers know what they get for any tier.
 *
 *   2. Tiers are CSS classes, not inline styles. Tailwind purge keeps the
 *      bundle tight; theming/dark-mode tokens compose naturally.
 *
 *   3. The flame icon is from lucide-react (already in the codebase). We
 *      don't ship a custom SVG just to differ from lucide — every byte of
 *      bundle is a tax on cold start.
 *
 *   4. aria-hidden by default. This is a DECORATION accompanying a number;
 *      the streak number itself is the source of truth for screen readers.
 *      Pairing an icon with the same info redundantly causes SR users to
 *      hear "flame, 14 days" instead of "14 days".
 *
 *   5. `motion` opt-in. Animation is OFF when the user has prefers-reduced-
 *      motion set (handled at the Tailwind layer via `motion-safe:` prefix).
 *      A flickering flame next to a 100-day streak is delightful for most
 *      users, hostile for vestibular-disorder users.
 */
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlameTier = "none" | "ember" | "flame" | "blaze" | "inferno";

/**
 * Map a streak count to a visual tier. Boundaries are product decisions;
 * change them here in one place. Avoiding magic numbers in JSX is the
 * cheapest investment in long-term maintainability.
 */
export function streakTier(days: number): FlameTier {
  if (days <= 0) return "none";
  if (days < 7) return "ember";
  if (days < 30) return "flame";
  if (days < 100) return "blaze";
  return "inferno";
}

interface StreakFlameProps {
  /** Streak length in days. Drives the visual tier. */
  days: number;
  /** Visual size — small (chip), medium (card), large (hero). */
  size?: "sm" | "md" | "lg";
  /** Pulse animation on big streaks. Defaults to true; respects prefers-reduced-motion. */
  animate?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StreakFlameProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

/**
 * Per-tier color and motion. Drop-in pattern: any new tier only needs to
 * be added to this map and `streakTier()` above — no component edits.
 */
const TIER_CLASSES: Record<FlameTier, string> = {
  none: "text-zinc-600",
  ember: "text-amber-500",
  flame: "text-orange-500",
  blaze: "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]",
  inferno:
    "text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.7)] motion-safe:animate-pulse",
};

export function StreakFlame({
  days,
  size = "md",
  animate = true,
  className,
}: StreakFlameProps) {
  const tier = streakTier(days);

  return (
    <Flame
      aria-hidden="true"
      className={cn(
        SIZE_CLASSES[size],
        TIER_CLASSES[tier],
        // Disable per-tier motion globally if caller opts out.
        !animate && "motion-safe:animate-none",
        className
      )}
    />
  );
}
