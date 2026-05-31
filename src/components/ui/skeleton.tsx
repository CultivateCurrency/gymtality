/**
 * Skeleton — loading placeholder primitive.
 *
 * Use shape-and-size-mimicking skeletons over spinners for content
 * placeholders. Spinners are for opaque transitions ("send button is
 * thinking"); skeletons reserve LAYOUT space so the page doesn't reflow
 * when data arrives, eliminating Cumulative Layout Shift.
 *
 * Accessibility: marked role="status" + aria-label="Loading" so screen
 * readers announce loading state once, not for every individual rect.
 * Parent containers wrap multiple skeletons should set aria-busy="true"
 * on the container instead so SR users hear ONE announcement, not N.
 *
 * Usage:
 *   <Skeleton className="h-4 w-24" />                 // single line
 *   <div aria-busy>
 *     <Skeleton className="h-8 w-32 mb-2" />
 *     <Skeleton className="h-4 w-full" />
 *   </div>
 */
import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        // pulse + subtle rounded corners + low-contrast bg over the dark theme.
        // The contrast level is deliberate: skeletons should be CLEARLY visible
        // (so the user knows something's loading) but not so loud they're
        // mistaken for real content.
        "animate-pulse rounded-md bg-zinc-800/60",
        className
      )}
      {...props}
    />
  );
}
