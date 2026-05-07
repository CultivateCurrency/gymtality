# GYMTALITY — Build Log & PRD

**Last Updated:** 2026-03-25
**Live URL:** https://gymtality.fit
**Domain:** gymtality.fit (GoDaddy) → Oracle Cloud VPS (167.234.214.60)
**Project root:** `./forge-fitness/`

---

## BUILD STATUS: ~97% Complete

| Category | Built | Total | Status |
|----------|-------|-------|--------|
| Pages | 56 | 56 | All created |
| API Routes | 97 files / 180+ endpoints | 97 | All created |
| DB Models | 35+ | 35+ | All created |
| Pages wired to APIs | ~42 | 56 | ~14 need wiring |
| Integrations | 4 fully, 1 partial, 1 working | 6 | See integration section |

---

# PRODUCT REQUIREMENTS (PRD)

## Subscription Tiers

| Plan | Price | Features |
|------|-------|----------|
| Basic | $9.99/mo | Workout browsing, community, events |
| Premium | $19.99/mo | + Live streaming, messaging, music |
| Elite | $39.99/mo | + Coach 1:1, priority support, all features |

## 1. Authentication & Onboarding

| Feature | Status | Notes |
|---------|--------|-------|
| Sign up with email + OTP verification (Resend) | DONE | |
| Login with JWT session (NextAuth.js) | DONE | |
| Forgot Password (3-step: email → OTP → new password) | DONE | |
| Role-based redirect after login | DONE | |
| Fitness questionnaire onboarding | DONE | |
| Stripe subscription selection during signup | DONE | Needs webhook URL registered |
| Email availability check | DONE | |
| Resend OTP | DONE | |

## 2. Member App (`/member/*`)

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard (streak, workouts, sessions, events, streams) | DONE | Real stats from API |
| Workouts (browse, search, filter, pagination) | DONE | |
| Workout session logging (Forge Score) | DONE | |
| Community posts (feed, likes, comments, saves) | DONE | |
| Community groups (join/leave, create) | DONE | |
| Workout Together requests | DONE | |
| Events (browse, RSVP, capacity, waitlist) | DONE | |
| Music (albums, songs, playlists, full player) | DONE | |
| Live streaming (watch, viewer count) | DONE | AWS IVS |
| Shop (browse products, cart, Stripe checkout) | DONE | |
| Goals (set/track fitness goals) | DONE | |
| Activity (workout history, weekly/monthly) | DONE | Calorie estimate uses flat 250/workout |
| Profile (edit photo, bio, stats) | DONE | |
| Questionnaire | DONE | |
| Follow/unfollow system | DONE | |
| Block users | DONE | |
| Notifications (in-app) | DONE | |
| Messages (1:1 chat with coaches) | DONE | QuickBlox REST API |
| Explore (search across content) | PARTIAL | UI exists, search not wired |
| Referrals (link generation + tracking) | PARTIAL | UI exists, link generation not wired |
| Settings (password, subscription, prefs) | PARTIAL | UI exists, save not wired |
| Support / Help | PARTIAL | Stub page |
| Donations (tip coaches) | PARTIAL | UI exists, Stripe not wired |
| Leaderboard | DONE | Rankings by points/activity |
| Badges | DONE | Achievement page |

## 3. Coach App (`/coach/*`)

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard (clients, plans, earnings, sessions) | DONE | Real stats |
| Clients CRM (list, stats) | DONE | |
| Client notes | PARTIAL | **BUG: Missing `/api/coach/clients/[id]/notes` route — 404s** |
| Earnings (monthly, total, transactions) | DONE | Hardcoded "+18%" and stale payout date |
| Stripe Connect (coach payouts) | DONE | |
| Live streaming (go live, OBS creds, end stream) | DONE | AWS IVS |
| Donations received | DONE | |
| Content upload (workout plans, exercises) | PARTIAL | Form exists, file upload not wired to OCI |
| Schedule (calendar view) | PARTIAL | Calendar placeholder |
| Settings (profile, certifications, photo) | PARTIAL | Form exists, save not wired |
| Videos | PARTIAL | Stub page |
| Notifications | PARTIAL | Stub page |
| Reports | PARTIAL | Stub page |
| Help | PARTIAL | Stub page |

## 4. Admin Portal (`/admin/*`)

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard (platform stats, pending actions) | DONE | Real stats |
| User management (search, filter, block, delete) | DONE | |
| Coach approval queue (approve/deny) | DONE | |
| Analytics (user growth, revenue, top coaches) | DONE | **BUG: Charts use hardcoded fake data arrays** |
| Subscriptions (plans, member counts, MRR) | DONE | **BUG: Coupon table is entirely fake data** |
| Moderation (reports queue, resolve/dismiss) | DONE | |
| Questionnaire builder (CRUD questions) | DONE | |
| Content CMS (categories, books, music tabs) | PARTIAL | Partial wiring |
| Events management | PARTIAL | Stub page |
| Commerce (products CRUD) | PARTIAL | Form exists, no validation |
| CMS Pages (about, privacy, terms editor) | PARTIAL | Form exists, API not fully wired |
| Settings (tenant config) | PARTIAL | Stub — tenant config not wired |
| Reports | PARTIAL | Stub page |
| Orders management | DONE | |
| Donations tracking | DONE | |

## 5. Static Pages

| Page | Status |
|------|--------|
| Home / Landing | DONE |
| About | DONE |
| Privacy Policy | DONE |
| Terms of Service | DONE |

---

# THIRD-PARTY INTEGRATIONS

| Service | Status | Details |
|---------|--------|---------|
| **Stripe** | WORKING | 6 API routes: subscribe, checkout, donate, portal, connect, webhook. Plans: Basic $9.99, Premium $19.99, Elite $39.99. Stripe Connect for coach payouts. Test keys on server. **TODO:** Register webhook URL, switch to live keys. |
| **Resend** | WORKING | 14 branded email templates. All wired. **TODO:** Verify gymtality.fit domain so emails come from real domain. |
| **Oracle Cloud Object Storage** | PARTIAL (BUG) | S3-compatible client configured. Upload/delete functions exist. `POST /api/upload` route exists. **BUG:** `storage.ts:49` — `endpoint` variable defined inside `getS3Client()` but referenced in `uploadFile()` — out of scope, all uploads crash with ReferenceError. |
| **Amazon IVS** | WORKING | Create/delete channels, get/stop streams, viewer counts. Coach and member streaming pages fully wired. Credentials on server (us-east-1). |
| **QuickBlox** | WORKING | REST API integration (not SDK). Session creation with HMAC, user creation, message listing/sending, dialog management. 4 message routes + 2 custom hooks. |
| **Google Fit** | WORKING | OAuth flow (authorization, token exchange, refresh). Data fetching: steps, calories, heart rate, sleep, distance, active minutes. 6 wearable routes. Google Cloud project configured. |

---

# DATABASE — 35+ Models

All models include `tenantId` for multi-tenancy.

**Core:** Tenant, User, UserProfile, CoachProfile, ClientNote
**Social:** Post, Comment, Like, Save, Follow, WorkoutRequest, Group, GroupMember, Block, Report
**Fitness:** WorkoutPlan, Exercise, WorkoutSession, SessionExercise, Goal, Category
**Content:** Album, Song, Playlist, PlaylistSong, Book, Stream
**Events:** Event, EventBooking
**Commerce:** Product, CartItem, Order, OrderItem, Subscription, Donation, AffiliateLink, Referral
**Admin:** Questionnaire, CmsPage, Notification, NotificationPreference
**Gamification:** Challenge, ChallengeParticipant
**Health:** MealPlan, Meal, WearableConnection, WearableData, Review

**Seed data deployed:** 16 users, 6 workout plans, 8 events, 4 albums (21 songs), 10 products, 5 streams, 8 goals, 10 subscriptions, and more.

---

# API ROUTE INDEX

## Auth (6 routes)
- `POST /api/auth/signup` — Registration with OTP
- `POST /api/auth/verify` — Email verification
- `POST /api/auth/forgot-password` — Password reset flow
- `POST /api/auth/resend-otp` — Resend OTP email
- `POST /api/auth/check-email` — Email availability
- `GET/POST /api/auth/[...nextauth]` — NextAuth providers & sessions

## Users & Profiles (10 routes)
- `GET/PUT /api/users/[id]/profile` — Profile CRUD
- `GET /api/users/[id]` — Public profile
- `GET/POST /api/users/[id]/follow` — Follow/unfollow
- `POST /api/users/[id]/block` — Block user
- `GET /api/users/me` — Current user
- `GET /api/users/me/stats` — Activity stats
- `GET /api/users/me/timeline` — Feed
- `GET /api/users/me/blocked` — Blocked list
- `POST /api/users/change-password` — Password change
- `POST /api/users/questionnaire` — Health questionnaire

## Workouts (5 routes)
- `GET/POST /api/workouts` — Plan CRUD
- `GET/PUT/DELETE /api/workouts/[id]` — Plan management
- `GET/POST /api/workouts/[id]/exercises` — Exercise management
- `GET/POST /api/workouts/sessions` — Session logging
- `GET/PUT /api/workouts/sessions/[id]` — Session detail/update

## Community (8 routes)
- `GET/POST /api/community/posts` — Social feed
- `GET/PUT/DELETE /api/community/posts/[id]` — Post management
- `POST /api/community/posts/[id]/like` — Like
- `POST /api/community/posts/[id]/save` — Save
- `GET/POST /api/community/posts/[id]/comments` — Comments
- `GET/POST /api/community/groups` — Groups
- `GET/PUT /api/community/groups/[id]` — Group management
- `POST /api/community/workout-request` — Workout buddy

## Events (5 routes)
- `GET/POST /api/events` — Event CRUD
- `GET/PUT/DELETE /api/events/[id]` — Event management
- `POST /api/events/[id]/book` — Booking
- `GET /api/events/bookings` — User bookings
- `POST /api/events/[id]/checkin` — Check-in

## Payments (6 routes)
- `POST /api/payments/subscribe` — Stripe subscription
- `POST /api/payments/checkout` — Shop checkout
- `POST /api/payments/donate` — Donations
- `POST /api/payments/connect` — Coach Stripe Connect
- `GET /api/payments/portal` — Customer portal
- `POST /api/payments/webhook` — Stripe webhooks

## Messages (4 routes)
- `GET/POST /api/messages/chat` — Chat (QuickBlox)
- `GET /api/messages/dialogs` — Conversations
- `GET /api/messages/session` — Session mgmt
- `GET /api/messages/users` — Messageable users

## Streaming (2 routes)
- `GET/POST /api/streaming` — Stream CRUD (AWS IVS)
- `GET/PUT /api/streaming/[id]` — Stream management

## Music (5 routes)
- `GET/POST /api/music/albums` — Album CRUD
- `GET/PUT/DELETE /api/music/albums/[id]` — Album management
- `GET/POST /api/music/songs` — Song management
- `GET/PUT/DELETE /api/music/songs/[id]` — Song details
- `GET/POST/DELETE /api/music/playlists` — Playlist CRUD

## Shop (6 routes)
- `GET/POST /api/shop/products` — Products
- `GET/PUT/DELETE /api/shop/products/[id]` — Product management
- `GET/POST /api/shop/cart` — Cart
- `GET/PUT/DELETE /api/shop/cart/[id]` — Cart items
- `GET/POST /api/shop/orders` — Orders
- `GET /api/shop/orders/[id]` — Order details

## Coach (6 routes)
- `GET /api/coach/dashboard` — Analytics
- `GET /api/coach/clients` — Client list
- `GET /api/coach/notifications` — Notifications
- `GET /api/coach/donations` — Donations received
- `GET /api/coach/earnings` — Revenue
- `GET /api/coach/reports` — Performance reports

## Admin (21 routes)
- `GET /api/admin/analytics` — Dashboard analytics
- `GET/POST/PUT/DELETE /api/admin/users/[id]` — User management
- `GET/POST /api/admin/coaches` — Coach approval
- `GET/POST /api/admin/categories/[id]` — Categories
- `GET/POST /api/admin/music/albums` — Music admin
- `GET/POST /api/admin/music/songs` — Song admin
- `GET/POST /api/admin/books` — Books
- `GET/POST /api/admin/orders` — Order monitoring
- `GET/POST /api/admin/subscriptions` — Subscription mgmt
- `GET/POST /api/admin/reports` — Reports
- `GET/POST /api/admin/moderation` — Content moderation
- `GET/POST /api/admin/questionnaire` — Questionnaire
- `GET /api/admin/cms` — CMS config
- `GET /api/admin/settings` — Tenant settings
- `GET /api/admin/events` — Events
- `GET /api/admin/donations` — Donations

## Other Routes
- `GET/POST /api/goals` + `GET/PUT/DELETE /api/goals/[id]` — Goals
- `GET/POST /api/notifications` + preferences — Notifications
- `POST/GET/DELETE /api/wearables/*` — Wearable sync (6 routes)
- `GET/POST /api/meals` + `GET/PUT/DELETE /api/meals/[id]` — Meal plans
- `GET/POST /api/referrals` — Affiliate links
- `GET /api/leaderboard` — Rankings
- `POST /api/reviews` — Coach/workout reviews
- `GET /api/activity` — Activity feed
- `POST /api/help` — Support tickets
- `POST /api/donations` — Tip processing
- `POST /api/upload` — File upload (S3)

---

# GAP ANALYSIS vs COMPETITORS

Compared against: Trainerize, TrueCoach, Everfit, Caliber, Future, Peloton, MyFitnessPal, Fitbod

## HIGH PRIORITY (expected by paying users)

| Missing Feature | Why It Matters | Competitor |
|-----------------|---------------|------------|
| **Progress photos** (before/after) | Table-stakes for coaching; no model or UI exists | TrueCoach, Caliber, Everfit |
| **Coach-to-client program assignment** | Clients browse a library; coaches can't assign specific plans | TrueCoach, Trainerize, Everfit |
| **Body measurements tracking** (weight/bf% over time) | No historical tracking model | Caliber, TrueCoach |
| **Daily workout schedule view** ("Today's workout") | Members see a library, not a daily plan | Trainerize, Everfit, Fitbod |
| **Push notifications** | No Firebase/service worker; in-app only | All competitors |
| **Rate limiting on signup/login** | Auth endpoints unprotected | Industry standard |

## MEDIUM PRIORITY (expected within 3 months)

| Missing Feature | Competitor |
|-----------------|------------|
| Exercise demo video library | Trainerize, Everfit, Fitbod |
| 1RM / personal record tracking | Fitbod, Caliber |
| Workout templates / copy functionality | TrueCoach, Trainerize |
| Client weekly check-in forms | TrueCoach, Caliber |
| In-app invoice / receipt view | All paid platforms |
| Account deletion / data export (GDPR/CCPA) | Legal requirement |

## LOW PRIORITY (differentiators)

| Missing Feature | Competitor |
|-----------------|------------|
| AI-generated workout plans | Fitbod, Future |
| Habit tracking | Caliber |
| In-app video calling | Future, Caliber |
| Automated workout periodization | Trainerize |

---

# MVP FEATURE TIERS

## TIER 1 — MUST SHIP (launch blockers)
- Fix `storage.ts` endpoint bug (uploads broken)
- Create `/api/coach/clients/[id]/notes` route
- Wire member settings save (password, subscription, prefs)
- Wire coach settings save (profile, certifications)
- Wire file uploads into profile/content forms
- Fix hardcoded data (admin charts, coach earnings, coupon table)
- ✅ Register Stripe webhook URL — confirmed active at https://www.gymtality.fit/api/payments/webhook
- ✅ Verify gymtality.fit in Resend — domain verified

## TIER 2 — SHIP AS-IS (already working)
Community, Events, Streaming, Music, Shop, Goals, Activity, Notifications, Admin, Coach earnings, Questionnaire, Messaging

## TIER 3 — v1.1 (post-launch, 30 days)
Explore search, Referrals, Donations page, Coupons, Coach schedule calendar, Admin CMS, Admin tenant settings, Calorie fix, Coach stubs

## TIER 4 — v1.2+ (can wait months)
Wearables UI, White-label multi-tenancy, Gamification, VOD replays, Google Ads, Email digests, Reviews UI, AI workouts

---

# SERVER & DEPLOYMENT

| Item | Status |
|------|--------|
| Domain | gymtality.fit (GoDaddy → Oracle Cloud) |
| SSL | Let's Encrypt (auto-renews) — cert is for www.gymtality.fit |
| Nginx | Reverse proxy on port 443 |
| Node.js 20 | Running |
| PostgreSQL 14 | Running |
| PM2 | Process manager |
| Database seeded | Demo data loaded |
| GitHub repo | CultivateCurrency/FORGE-FITNESS |
| USER BACKEND | Running on port 4000 as `gymtality-api` PM2 process |

### PM2 Processes
| ID | Name | Port |
|----|------|------|
| 0 | forge-fitness | 3000 |
| 1 | gymtality-api | 4000 |

### Nginx Routing (`/etc/nginx/sites-enabled/forge-fitness`)
- `/api/auth/` → port 3000 (NextAuth routes stay in Next.js)
- `/api/` → port 4000 (USER BACKEND)
- `/` → port 3000 (Next.js frontend)

### Databases
| DB | User | Password | Used By |
|----|------|----------|---------|
| forge_fitness | forge | forge123 | forge-fitness frontend |
| gymtality | gymtality | gymtality | USER BACKEND |

### SSH Access
```
ssh -i "C:\Users\Urban Inspiration NW\Downloads\ssh-key-2026-03-17.key" ubuntu@167.234.214.60
```

### Server Env Vars Configured
- DATABASE_URL
- NEXTAUTH_SECRET (real cryptographic key)
- NEXTAUTH_URL (https://gymtality.fit)
- Stripe (test keys)
- Resend API key
- OCI Object Storage
- AWS IVS (us-east-1)
- QuickBlox credentials
- Google Fit OAuth

### Login Credentials (Seed Data)
- **Admin:** admin@gymtality.fit / Admin123!
- **Coach:** marcus@gymtality.fit / Coach123!
- **Member:** alex@example.com / Member123!

---

# DEPLOYMENT LOG

## 2026-03-24 — USER BACKEND Deployed + Login Fixed

### USER BACKEND (gymtality-api) — New Service
1. Created `.env` with DATABASE_URL, JWT secrets, all service credentials
2. Created `prisma.config.ts` (required by Prisma 7)
3. Fixed ESM→CommonJS: `tsconfig.json` module=CommonJS, moduleResolution=node
4. Fixed ESM→CommonJS: `package.json` type=commonjs
5. Added `moduleFormat = "commonjs"` to `prisma/schema.prisma` generator
6. Renamed `require()` → `requireEnv()` in `src/lib/env.ts` (CJS conflict)
7. Built locally → copied `dist/` to VPS via SCP
8. Started with PM2 as `gymtality-api`
9. Health check passing: `curl http://localhost:4000/health` ✓

### forge-fitness Login Fix
1. Added nginx `/api/auth/` block to preserve NextAuth routes (prevent backend intercept)
2. Found root cause: Auth.js v5 uses `authjs.session-token` cookie; old middleware used `getToken` looking for `next-auth.session-token`
3. Updated `src/middleware.ts` to check both cookie names
4. Rebuilt forge-fitness + restarted PM2
5. Login now works ✓ — redirects to `/member/dashboard`

---

# WHITE-LABEL SaaS PLAN

Post-launch, Gymtality becomes a platform sold to other gym businesses:
- Each gym gets its own subdomain (e.g., `mygym.gymtality.fit`)
- Per-tenant: custom logo, colors, feature toggles
- Billing: gym owners pay a SaaS subscription fee
- Architecture already supports this via `tenantId` on all tables
- Requires: subdomain routing, per-tenant theming, tenant admin settings

---

# WHAT'S LEFT TO DO

## Priority 1 — Tier 1 Fixes (Sprint 1-2)
- [ ] Fix `storage.ts` endpoint scoping bug
- [ ] Create `/api/coach/clients/[id]/notes` route
- [ ] Fix hardcoded admin chart data
- [ ] Fix hardcoded coach earnings percentages + stale date
- [ ] Remove fake coupon table data
- [ ] Wire member settings save
- [ ] Wire coach settings save
- [ ] Wire file uploads into forms

## Priority 2 — New Features (Sprint 3-4)
- [ ] Coach-to-client program assignment (new model + API + UI)
- [ ] Progress photos (new model + API + UI)

## Priority 3 — External Config
- [ ] Register Stripe webhook URL → `https://gymtality.fit/api/payments/webhook`
- [ ] Verify gymtality.fit domain in Resend dashboard
- [ ] Add www.gymtality.fit DNS record + SSL
- [ ] Switch Stripe to live keys when ready

## Priority 4 — v1.1 Post-Launch
- [ ] Rate limiting on auth endpoints
- [ ] Body measurements tracking
- [ ] Daily workout schedule view
- [ ] Member referral link generation
- [ ] Member explore search
- [ ] Coach schedule calendar
- [ ] Coupon/discount system (Stripe Coupons)
- [ ] Push notifications (Firebase)
- [ ] GDPR account deletion + data export

## Priority 5 — v1.2+ Future
- [ ] Wearables UI polish
- [ ] Multi-tenant white-label (subdomain routing, theming)
- [ ] Leaderboard/gamification expansion
- [ ] VOD replay library
- [ ] Google Ads integration
- [ ] Weekly email digests
- [ ] Reviews/ratings UI
- [ ] Client weekly check-in forms
- [ ] Exercise demo video library

---

## ARCHITECTURE COMPLIANCE

| Rule | Status |
|------|--------|
| Every model has tenantId | Pass |
| API responses use { success, data/error } | Pass |
| Middleware injects x-user-id, x-user-role, x-tenant-id | Pass |
| No Prisma in middleware (Edge runtime) | Pass |
| Role-based routing (/member/*, /coach/*, /admin/*) | Pass |
| Build with NODE_OPTIONS flag | Pass |
| Never remove features | Pass |
