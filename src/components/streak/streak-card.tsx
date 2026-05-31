"use client";

/**
 * StreakCard — production component for the member workout streak.
 *
 * Architecture: presentational. Data comes from `useStreak()` by default
 * (zero-config use case) OR can be injected via the `data` / `loading` /
 * `error` / `onRetry` props (Storybook, tests, sub-page mounts that share
 * the same payload). The dual signature keeps the common case to one line
 * and the testable case to plain props.
 *
 *
 *  ─── Variants ──────────────────────────────────────────────────────────
 *
 *  hero      Dashboard primary surface. Big number, side-by-side flame,
 *            secondary line shows longest + last active. Use one per page.
 *
 *  compact   Sidebar / tile / leaderboard tooltip. Square aspect, flame
 *            stacked over number. Use anywhere you need a "their streak"
 *            indicator next to a name.
 *
 *  inline    Plain text + small flame inline with copy. Use inside a
 *            paragraph or list-item where a card would feel heavy.
 *
 *
 *  ─── All four states are handled internally ────────────────────────────
 *
 *  loading   shows StreakSkeleton (matched layout — no CLS)
 *  error     shows fallback w/ retry button (compact tier never throws
 *            its parent layout off)
 *  empty     shows zero-state copy + CTA pointing at /member/workouts
 *  data      renders the live numbers
 *
 *
 *  ─── Accessibility ─────────────────────────────────────────────────────
 *
 *  - Semantic role="group" with descriptive aria-label so SR users hear
 *    one announcement (not "Flame, 14, days, streak")
 *  - Flame icon is aria-hidden; the number/text carries the meaning
 *  - Error retry is a real <button> with explicit aria-label
 *  - Empty-state CTA is a real <Link>, focusable, keyboard-navigable
 *  - prefers-reduced-motion respected via StreakFlame
 *
 *
 *  ─── Usage ─────────────────────────────────────────────────────────────
 *
 *    <StreakCard />                          // hero variant, auto data
 *    <StreakCard variant="compact" />        // sidebar/tile
 *    <StreakCard variant="inline" />         // inside copy
 *
 *    // Inject data for tests / Storybook:
 *    <StreakCard
 *      data={{ current: 14, longest: 47, todayLogged: true,
 *              lastActiveDate: "2026-05-30", timezone: "UTC" }}
 *    />
 */
import Link from "next/link";
import { Flame, AlertCircle } from "lucide-react";
import { useStreak } from "@/hooks/use-streak";
import type { StreakData } from "@/hooks/use-streak";
import { StreakFlame, streakTier } from "./streak-flame";
import { StreakSkeleton } from "./streak-skeleton";
import { cn } from "@/lib/utils";

type Variant = "hero" | "compact" | "inline";

interface StreakCardProps {
  /**
   * Visual variant. Defaults to "hero" — when you mean "small", say so
   * explicitly so the call site reads at a glance.
   */
  variant?: Variant;
  /**
   * Inject data externally instead of calling the hook. When provided,
   * the internal hook is NOT called. Use for tests / Storybook / when
   * the parent already has the payload from a different source.
   */
  data?: StreakData | null;
  /** Inject loading state externally. Honored only if `data` is also provided/null. */
  loading?: boolean;
  /** Inject error externally. */
  error?: string | null;
  /** Called when the error-state retry button is pressed. */
  onRetry?: () => void;
  /** Override the empty-state CTA destination. Defaults to /member/workouts. */
  emptyCtaHref?: string;
  className?: string;
}

export function StreakCard({
  variant = "hero",
  data: injectedData,
  loading: injectedLoading,
  error: injectedError,
  onRetry,
  emptyCtaHref = "/member/workouts",
  className,
}: StreakCardProps) {
  // Pattern: call the hook UNCONDITIONALLY (Rules of Hooks) but ignore its
  // state when the parent provided data. This lets the same component work
  // both ways with zero conditional-hook risk.
  const internal = useStreak();
  const data = injectedData !== undefined ? injectedData : internal.data;
  const loading = injectedData !== undefined ? injectedLoading ?? false : internal.loading;
  const error = injectedData !== undefined ? injectedError ?? null : internal.error;
  const refetch = injectedData !== undefined ? onRetry : internal.refetch;

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading) return <StreakSkeleton variant={variant} className={className} />;

  // ─── Error ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <StreakErrorState
        variant={variant}
        message={error}
        onRetry={refetch}
        className={className}
      />
    );
  }

  // ─── Empty (succeeded, zero history) ────────────────────────────────────
  if (data && data.current === 0 && data.longest === 0) {
    return <StreakEmptyState variant={variant} href={emptyCtaHref} className={className} />;
  }

  // No data and no loading/error/empty? Render nothing — defensive guard.
  if (!data) return null;

  // ─── Populated ──────────────────────────────────────────────────────────
  if (variant === "inline") return <StreakInline data={data} className={className} />;
  if (variant === "compact") return <StreakCompact data={data} className={className} />;
  return <StreakHero data={data} className={className} />;
}

/* ─── Populated subcomponents ────────────────────────────────────────────── */

function StreakHero({ data, className }: { data: StreakData; className?: string }) {
  const tier = streakTier(data.current);
  const subtitle = buildSubtitle(data);
  const ariaLabel = `Current streak: ${data.current} ${data.current === 1 ? "day" : "days"}. Longest: ${data.longest}.`;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "rounded-2xl border p-5 flex items-center gap-4",
        // Tier ramps the border + bg accent. Inferno gets the loudest treatment.
        "border-zinc-800 bg-zinc-900/40",
        tier === "blaze" && "border-orange-500/40 bg-orange-500/5",
        tier === "inferno" && "border-orange-400/50 bg-orange-500/10",
        className
      )}
    >
      {/* Visual: big flame in a rounded tile */}
      <div
        aria-hidden="true"
        className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30"
      >
        <StreakFlame days={data.current} size="lg" />
      </div>

      {/* Stats */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-orange-400/80 uppercase tracking-wider font-semibold">
          Streak
        </p>
        <p className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {data.current} <span className="text-lg text-zinc-400 font-normal">{data.current === 1 ? "day" : "days"}</span>
        </p>
        <p className="text-xs text-zinc-400 mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

function StreakCompact({ data, className }: { data: StreakData; className?: string }) {
  const ariaLabel = `${data.current}-day streak`;
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30",
        className
      )}
    >
      <StreakFlame days={data.current} size="md" />
      <span className="text-lg font-black text-white leading-none mt-0.5">
        {data.current}
      </span>
      <span className="text-[9px] text-orange-400/70 uppercase tracking-wide">
        {data.current === 1 ? "day" : "days"}
      </span>
    </div>
  );
}

function StreakInline({ data, className }: { data: StreakData; className?: string }) {
  return (
    <span
      role="group"
      aria-label={`${data.current}-day streak`}
      className={cn("inline-flex items-center gap-1.5 text-sm text-zinc-300", className)}
    >
      <StreakFlame days={data.current} size="sm" />
      <span className="font-semibold text-white">{data.current}</span>
      <span className="text-zinc-400">{data.current === 1 ? "day streak" : "day streak"}</span>
    </span>
  );
}

/* ─── Empty + Error subcomponents ────────────────────────────────────────── */

function StreakEmptyState({
  variant,
  href,
  className,
}: {
  variant: Variant;
  href: string;
  className?: string;
}) {
  // Inline: just say "no streak yet" — no card chrome.
  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-zinc-500", className)}>
        <Flame aria-hidden="true" className="h-4 w-4 text-zinc-600" />
        <Link
          href={href}
          className="underline decoration-zinc-700 hover:decoration-orange-400 hover:text-orange-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-sm"
        >
          Start your first workout
        </Link>
      </span>
    );
  }

  // Compact: still small, but actionable.
  if (variant === "compact") {
    return (
      <Link
        href={href}
        aria-label="No streak yet — start your first workout"
        className={cn(
          "shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-orange-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
          className
        )}
      >
        <Flame aria-hidden="true" className="h-5 w-5 text-zinc-600" />
        <span className="text-[10px] text-zinc-500 leading-tight mt-1 text-center px-1">Start</span>
      </Link>
    );
  }

  // Hero
  return (
    <div
      role="group"
      aria-label="No active streak"
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center gap-4",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700/50"
      >
        <Flame className="h-7 w-7 text-zinc-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
          Streak
        </p>
        <p className="text-lg font-semibold text-white leading-tight">No streak yet</p>
        <Link
          href={href}
          className="inline-flex items-center text-xs text-orange-400 hover:text-orange-300 mt-0.5 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-sm"
        >
          Log your first workout →
        </Link>
      </div>
    </div>
  );
}

function StreakErrorState({
  variant,
  message,
  onRetry,
  className,
}: {
  variant: Variant;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  // Inline: tiny, non-blocking.
  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm text-zinc-500", className)}>
        <AlertCircle aria-hidden="true" className="h-4 w-4 text-zinc-600" />
        <span>Streak unavailable</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Retry loading streak"
            className="underline text-orange-400 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-sm"
          >
            retry
          </button>
        )}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onRetry}
        aria-label={`Streak failed to load: ${message}. Click to retry.`}
        className={cn(
          "shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
          className
        )}
      >
        <AlertCircle aria-hidden="true" className="h-5 w-5 text-zinc-600" />
        <span className="text-[9px] text-zinc-500 mt-0.5">Retry</span>
      </button>
    );
  }

  // Hero
  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center gap-4",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700/50"
      >
        <AlertCircle className="h-7 w-7 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Streak</p>
        <p className="text-base font-semibold text-white leading-tight">Couldn&apos;t load streak</p>
        <p className="text-xs text-zinc-400 mt-0.5 truncate" title={message}>
          {message}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1.5 inline-flex items-center text-xs text-orange-400 hover:text-orange-300 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-sm"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function buildSubtitle(data: StreakData): string {
  // Compose the secondary line. Logic separate so it's testable in isolation
  // and the JSX stays declarative.
  if (data.todayLogged) {
    return `Logged today · longest ${data.longest}`;
  }
  if (data.current > 0) {
    return `Grace day — log today to extend · longest ${data.longest}`;
  }
  return `Longest streak: ${data.longest}`;
}
