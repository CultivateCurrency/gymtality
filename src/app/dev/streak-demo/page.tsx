/**
 * Streak component demo page — Storybook-without-Storybook.
 *
 * Renders every state of <StreakCard /> in every variant on one page so
 * designers, reviewers, and on-call can eyeball the matrix without booting
 * a separate tool. Lives under /dev/* — we ship it to prod intentionally
 * (it's a private, undocumented URL) because seeing the live styles in the
 * production build catches issues that Storybook misses (build env
 * differences, Tailwind purge, prod minifier).
 *
 * Routes are protected by middleware for member-or-above; this page is
 * fine to leave logged-in-only.
 *
 * To extend: add a new <Section> for a new state. Don't add conditionals
 * to existing sections — the value of this page is "you can see every
 * permutation at once".
 */
"use client";

import { StreakCard } from "@/components/streak/streak-card";
import { StreakFlame, streakTier } from "@/components/streak/streak-flame";
import type { StreakData } from "@/hooks/use-streak";

const fixtures = {
  fresh: { current: 0, longest: 0, todayLogged: false, lastActiveDate: null, timezone: "UTC" } as StreakData,
  oneDay: { current: 1, longest: 1, todayLogged: true, lastActiveDate: "2026-05-30", timezone: "UTC" } as StreakData,
  graceDay: { current: 3, longest: 12, todayLogged: false, lastActiveDate: "2026-05-29", timezone: "UTC" } as StreakData,
  ember: { current: 4, longest: 4, todayLogged: true, lastActiveDate: "2026-05-30", timezone: "UTC" } as StreakData,
  flame: { current: 14, longest: 47, todayLogged: true, lastActiveDate: "2026-05-30", timezone: "UTC" } as StreakData,
  blaze: { current: 32, longest: 32, todayLogged: false, lastActiveDate: "2026-05-29", timezone: "UTC" } as StreakData,
  inferno: { current: 187, longest: 187, todayLogged: true, lastActiveDate: "2026-05-30", timezone: "UTC" } as StreakData,
};

export default function StreakDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-12">
        <header>
          <h1 className="text-3xl font-bold">StreakCard — every state, every variant</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Reference page for designers + reviewers. The same component renders all of these.
          </p>
        </header>

        <Section title="Hero variant (dashboard primary)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Caption label="Loading">
              <StreakCard data={null} loading />
            </Caption>
            <Caption label="Error">
              <StreakCard data={null} error="Network failed" onRetry={() => {}} />
            </Caption>
            <Caption label="Empty (no sessions ever)">
              <StreakCard data={fixtures.fresh} />
            </Caption>
            <Caption label="1 day (today, ember)">
              <StreakCard data={fixtures.oneDay} />
            </Caption>
            <Caption label="3 days, grace day in effect">
              <StreakCard data={fixtures.graceDay} />
            </Caption>
            <Caption label="14 days (flame)">
              <StreakCard data={fixtures.flame} />
            </Caption>
            <Caption label="32 days (blaze, glow)">
              <StreakCard data={fixtures.blaze} />
            </Caption>
            <Caption label="187 days (inferno, animated)">
              <StreakCard data={fixtures.inferno} />
            </Caption>
          </div>
        </Section>

        <Section title="Compact variant (sidebar / tile)">
          <div className="flex flex-wrap gap-4 items-end">
            <Caption label="Loading"><StreakCard variant="compact" data={null} loading /></Caption>
            <Caption label="Error"><StreakCard variant="compact" data={null} error="x" onRetry={() => {}} /></Caption>
            <Caption label="Empty"><StreakCard variant="compact" data={fixtures.fresh} /></Caption>
            <Caption label="Ember"><StreakCard variant="compact" data={fixtures.ember} /></Caption>
            <Caption label="Flame"><StreakCard variant="compact" data={fixtures.flame} /></Caption>
            <Caption label="Blaze"><StreakCard variant="compact" data={fixtures.blaze} /></Caption>
            <Caption label="Inferno"><StreakCard variant="compact" data={fixtures.inferno} /></Caption>
          </div>
        </Section>

        <Section title="Inline variant (inside copy)">
          <div className="space-y-3 text-zinc-300">
            <p>Loading: <StreakCard variant="inline" data={null} loading /></p>
            <p>Error: <StreakCard variant="inline" data={null} error="boom" onRetry={() => {}} /></p>
            <p>Empty: <StreakCard variant="inline" data={fixtures.fresh} /></p>
            <p>1 day: <StreakCard variant="inline" data={fixtures.oneDay} /></p>
            <p>Flame: You&apos;re on a <StreakCard variant="inline" data={fixtures.flame} /> — keep it going.</p>
            <p>Inferno: <StreakCard variant="inline" data={fixtures.inferno} /></p>
          </div>
        </Section>

        <Section title="StreakFlame standalone (every tier)">
          <div className="flex gap-6 items-end">
            {[0, 1, 4, 14, 32, 100, 365].map((d) => (
              <div key={d} className="text-center">
                <StreakFlame days={d} size="lg" />
                <p className="text-xs text-zinc-500 mt-1">{d} days</p>
                <p className="text-[10px] text-zinc-600 uppercase">{streakTier(d)}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Responsive widths (hero)">
          <div className="space-y-3">
            <div className="w-full"><StreakCard data={fixtures.flame} /></div>
            <div className="w-96"><StreakCard data={fixtures.flame} /></div>
            <div className="w-64"><StreakCard data={fixtures.flame} /></div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 border-b border-zinc-800 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Caption({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-600 uppercase mb-1.5">{label}</p>
      {children}
    </div>
  );
}
