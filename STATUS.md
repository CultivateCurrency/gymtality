# GYMTALITY — Status Update

**Last Updated:** 2026-03-23
**Overall:** ~97% MVP Complete

---

## Current Sprint: Sprint 1 — Critical Bug Fixes

| # | Task | Status | Sprint |
|---|------|--------|--------|
| 1 | Slim CLAUDE.md to dev reference only | DONE | Sprint 0 |
| 2 | Expand BUILD_LOG.md with PRD + gap analysis | DONE | Sprint 0 |
| 3 | Move docs to FORGE FITNESS root (universal) | DONE | Sprint 0 |
| 4 | Fix `storage.ts` endpoint scoping bug | TODO | Sprint 1 |
| 5 | Create `/api/coach/clients/[id]/notes` route | TODO | Sprint 1 |
| 6 | Fix hardcoded data (admin charts, coach earnings, coupons) | TODO | Sprint 1 |
| 7 | Wire member settings save (password, subscription, prefs) | TODO | Sprint 2 |
| 8 | Wire coach settings save (profile, certifications) | TODO | Sprint 2 |
| 9 | Wire file uploads into profile/content forms | TODO | Sprint 2 |
| 10 | Build coach-to-client program assignment | TODO | Sprint 3 |
| 11 | Build progress photos feature | TODO | Sprint 4 |
| 12 | External config (Stripe webhook, Resend domain, live keys) | TODO | Sprint 5 |

---

## Sprint Timeline

| Sprint | Focus | Duration | Status |
|--------|-------|----------|--------|
| Sprint 0 | Documentation & foundation | 1 day | DONE |
| Sprint 1 | Critical bug fixes & blockers | 1 day | IN PROGRESS |
| Sprint 2 | Wire unwired pages | 2 days | UPCOMING |
| Sprint 3 | Coach program assignment | 2 days | UPCOMING |
| Sprint 4 | Progress photos | 2 days | UPCOMING |
| Sprint 5 | External config & launch prep | 0.5 day | UPCOMING |

**Estimated days to launch-ready: ~8.5 working days**

---

## What's Working (Ship As-Is)

Auth, Member Dashboard, Workouts, Community, Events, Music, Streaming, Shop, Goals, Activity, Notifications, Admin (full), Coach Dashboard + Earnings, Questionnaire, Messaging (QuickBlox), Follow/Block, Leaderboard, Badges

## What's Broken / Blocked

| Issue | Impact | Fix |
|-------|--------|-----|
| `storage.ts` endpoint bug | ALL file uploads crash | Hoist variable to module scope |
| Missing coach notes route | Coach client notes 404 | Create GET/POST route |
| Admin charts hardcoded | Fake growth/revenue charts | Wire to API data |
| Coach earnings "+18%" | Misleading static text | Calculate or remove |
| Coupon table fake | Fake coupon rows in admin | Remove or label "Coming Soon" |

## What's Deferred

**v1.1 (30 days post-launch):** Explore search, Referrals, Donations page, Coupons, Coach calendar, Admin CMS, Tenant settings, Calorie fix

**v1.2+ (months):** Wearables UI, White-label, Gamification, VOD replays, Google Ads, Email digests, Reviews UI, AI workouts

---

## Key Decisions

- **MVP top 2 new features:** Coach program assignment + Progress photos (chosen over body measurements, daily view, push notifications, rate limiting)
- **Document structure:** CLAUDE.md = slim dev reference, BUILD_LOG.md = full PRD + status, PARKING_LOT.md = audit findings, STATUS.md = sprint tracker
- **All docs live at:** `FORGE FITNESS/` root (universal, not buried in forge-fitness/)
