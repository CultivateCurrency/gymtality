/**
 * StreakCard — first frontend component test. Establishes the testing
 * pattern for the rest of the UI:
 *
 *   1. Mock data injection via props (the dual-API the component was
 *      designed for) — NO MSW, NO fetch interception. The hook path is
 *      tested separately; the COMPONENT test stays focused on rendering.
 *   2. Accessibility-first queries (getByRole, getByLabelText) — they
 *      ride on the same a11y attributes we promised users, so the test
 *      proves the contract isn't accidentally regressing.
 *   3. One assertion per "user-visible thing it should do" — not one per
 *      DOM class. Tests fail because the user-visible behavior changed,
 *      not because we renamed a tailwind class.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StreakCard } from "./streak-card";
import type { StreakData } from "@/hooks/use-streak";

const data = {
  flame: { current: 14, longest: 47, todayLogged: true, lastActiveDate: "2026-05-30", timezone: "UTC" } as StreakData,
  graceDay: { current: 3, longest: 12, todayLogged: false, lastActiveDate: "2026-05-29", timezone: "UTC" } as StreakData,
  empty: { current: 0, longest: 0, todayLogged: false, lastActiveDate: null, timezone: "UTC" } as StreakData,
  oneDay: { current: 1, longest: 1, todayLogged: true, lastActiveDate: "2026-05-30", timezone: "UTC" } as StreakData,
};

describe("StreakCard", () => {
  describe("populated state", () => {
    it("hero: renders current streak and longest, accessible label includes both", () => {
      render(<StreakCard data={data.flame} />);

      // Numbers user can see
      expect(screen.getByText("14")).toBeInTheDocument();
      expect(screen.getByText(/longest 47/i)).toBeInTheDocument();

      // a11y contract — one announcement, both numbers
      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-label", expect.stringContaining("14 days"));
      expect(group).toHaveAttribute("aria-label", expect.stringContaining("47"));
    });

    it("compact variant: square tile with number stacked", () => {
      render(<StreakCard variant="compact" data={data.flame} />);
      expect(screen.getByText("14")).toBeInTheDocument();
      // Stacked label adapts to plural
      expect(screen.getByText("days")).toBeInTheDocument();
    });

    it("inline variant: text-flow rendering with singular/plural agreement", () => {
      render(<StreakCard variant="inline" data={data.oneDay} />);
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText(/day streak/i)).toBeInTheDocument();
    });

    it("subtitle reflects todayLogged=true ('Logged today')", () => {
      render(<StreakCard data={data.flame} />);
      expect(screen.getByText(/logged today/i)).toBeInTheDocument();
    });

    it("subtitle reflects grace day when current>0 but todayLogged=false", () => {
      render(<StreakCard data={data.graceDay} />);
      expect(screen.getByText(/grace day/i)).toBeInTheDocument();
    });

    it("singular form for 1-day streak ('1 day', not '1 days')", () => {
      render(<StreakCard data={data.oneDay} />);
      // The hero variant renders "1 day" — singular
      expect(screen.getByText("day")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("hero: shows skeleton with aria-busy", () => {
      render(<StreakCard data={null} loading />);
      const skeleton = screen.getByRole("status", { name: /loading streak/i });
      expect(skeleton).toHaveAttribute("aria-busy", "true");
    });

    it("compact: smaller skeleton in same square footprint", () => {
      render(<StreakCard variant="compact" data={null} loading />);
      expect(screen.getByRole("status", { name: /loading streak/i })).toBeInTheDocument();
    });

    it("inline: inline-flow skeleton", () => {
      render(<StreakCard variant="inline" data={null} loading />);
      expect(screen.getByRole("status", { name: /loading streak/i })).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("hero: renders alert role with retry button", async () => {
      const onRetry = vi.fn();
      render(<StreakCard data={null} error="Network failed" onRetry={onRetry} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/network failed/i)).toBeInTheDocument();

      // Retry must be a real button, focusable, and fire the handler
      const retry = screen.getByRole("button", { name: /try again/i });
      await userEvent.click(retry);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("hero: hides retry button when no handler provided", () => {
      render(<StreakCard data={null} error="boom" />);
      expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
    });

    it("compact: entire tile is a retry button (clickable)", async () => {
      const onRetry = vi.fn();
      render(<StreakCard variant="compact" data={null} error="boom" onRetry={onRetry} />);

      const retry = screen.getByRole("button");
      await userEvent.click(retry);
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe("empty state", () => {
    it("hero: shows 'No streak yet' + CTA link to /member/workouts", () => {
      render(<StreakCard data={data.empty} />);

      expect(screen.getByText(/no streak yet/i)).toBeInTheDocument();
      // CTA is a real Link, not a button — focusable, keyboard-navigable
      const cta = screen.getByRole("link", { name: /log your first workout/i });
      expect(cta).toHaveAttribute("href", "/member/workouts");
    });

    it("honors emptyCtaHref override", () => {
      render(<StreakCard data={data.empty} emptyCtaHref="/onboarding/first-workout" />);
      const cta = screen.getByRole("link", { name: /log your first workout/i });
      expect(cta).toHaveAttribute("href", "/onboarding/first-workout");
    });

    it("inline: empty renders as a link inline with copy", () => {
      render(<StreakCard variant="inline" data={data.empty} />);
      expect(screen.getByRole("link", { name: /start your first workout/i })).toBeInTheDocument();
    });
  });

  describe("accessibility contracts", () => {
    it("populated hero: aria-label is a single, complete announcement", () => {
      render(<StreakCard data={data.flame} />);
      const group = screen.getByRole("group");
      // Must contain BOTH the current count AND the longest — SR users
      // hear "14 days … longest 47" not just "14"
      expect(group.getAttribute("aria-label")).toMatch(/14 days.*47/i);
    });

    it("singular day in aria-label when current=1 (no '1 days')", () => {
      render(<StreakCard data={data.oneDay} />);
      const group = screen.getByRole("group");
      expect(group.getAttribute("aria-label")).toMatch(/1 day(?!s)/);
    });

    it("decorative flame icon does NOT add itself as an aria-label", () => {
      // The Flame from lucide should be aria-hidden so it's not announced.
      // We verify by ensuring there's no rogue 'flame' text in the
      // accessible name tree.
      render(<StreakCard variant="compact" data={data.flame} />);
      const group = screen.getByRole("group");
      expect(group.getAttribute("aria-label")?.toLowerCase()).not.toContain("flame");
    });
  });
});
