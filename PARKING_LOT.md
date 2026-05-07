# GYMTALITY — Parking Lot

Tracks bugs, hardcoded data, orphaned routes, and audit findings.
**Last Updated:** 2026-03-23

---

## PRIOR ITEMS: ALL COMPLETE (2026-03-21)

All 9 broken items and 12 future enhancements from the original requirements audit have been built and deployed.
See git history for details.

---

## INTEGRATION AUDIT (2026-03-23)

Full frontend↔backend trace across 97 API route files and 222+ frontend fetch calls.

### Critical Bugs

- [ ] **Missing route `/api/coach/clients/[id]/notes`** — `coach/clients/page.tsx:112-113` calls this via both `useApi` (GET) and `useMutation` (POST). No backend route exists — only `/api/coach/clients/route.ts`. Client notes panel will 404.
- [ ] **`storage.ts:49` — `endpoint` variable out of scope** — `uploadFile()` references `endpoint` which is defined inside `getS3Client()` but not accessible in `uploadFile()`. Any file upload will throw `ReferenceError` at runtime.

### Hardcoded / Mock Data

- [ ] **Admin analytics charts use fake data** — `admin/analytics/page.tsx:34-50` has hardcoded `userGrowthData` and `revenueTrendData` arrays fed to charts. The API returns real stats for cards, but the charts ignore it.
- [ ] **Coupon table is entirely fake** — `admin/subscriptions/page.tsx:120-126` has hardcoded coupon array with comment "no coupons API exists yet". No `/api/admin/coupons` route.
- [ ] **Coach earnings "+18%" is hardcoded** — `coach/earnings/page.tsx:142` shows a static "+18% from last period" string, not calculated from real data.
- [ ] **Calorie estimate is flat** — `member/activity/page.tsx:126` uses `completed.length * 250` instead of real exercise/wearable calorie data.

### Orphaned Backend Routes (built, no frontend consumer)

- [ ] `/api/events/[id]/checkin` (POST, GET) — No event check-in UI exists
- [ ] `/api/music/playlists/[id]/songs` (POST, DELETE) — No add/remove song from playlist UI
- [ ] `/api/notifications/[id]` (PUT, DELETE) — No mark-read / delete notification UI
- [ ] `/api/shop/orders` + `/api/shop/orders/[id]` (GET, POST, PUT) — No order history page for members
- [ ] `/api/reviews` (GET, POST) — Review system built, no UI anywhere
- [ ] `/api/workouts/sessions/[id]` (PUT) — Session edit endpoint, no UI calls it

**Note:** `/api/payments/webhook` and `/api/wearables/callback` are correctly "orphaned" — they're called by Stripe and Google OAuth respectively, not by the frontend.

### Integration Status (all real, no mocks)

| Service | Status |
|---------|--------|
| Stripe (6 routes) | Real SDK, lazy-init |
| Resend (14 email templates) | Real SDK, graceful no-op if key missing |
| QuickBlox (4 message routes + hooks) | Real REST API |
| Amazon IVS (streaming routes) | Real AWS SDK |
| Oracle Object Storage (upload route) | Real S3-compat client (has endpoint bug above) |
| Google Fit (6 wearable routes) | Real OAuth + Fitness API |
