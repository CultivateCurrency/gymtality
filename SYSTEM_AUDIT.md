# GYMTALITY — Complete System Audit
**Generated:** 2026-05-04  
**Version:** 1.0  
**Live URL:** https://gymtality.fit

---

## 1️⃣ EXISTING APIS, ROUTES, SERVICES & INTEGRATIONS

### Architecture Overview
- **Frontend:** Next.js 15 (App Router) running on `https://gymtality.fit`
- **Backend:** Separate Node.js/Express API (not in this repo) on `https://api.gymtality.fit`
- **Current Repo:** Frontend-only with service libraries for third-party integrations

### Service Libraries Implemented

#### 🔐 Authentication (`src/lib/auth.ts`)
- `getCurrentUser()` — reads Zustand persisted auth state from localStorage
- `requireRole(userRole, allowedRoles)` — role-based access control
- OAuth integration ready (middleware injects headers from separate backend)

#### 💳 Payments (`src/lib/stripe.ts`)
- `getStripe()` — lazy-loaded Stripe instance
- `getOrCreateCustomer(email, name, userId)` — customer management
- `formatAmountForDisplay(amount)` — currency formatting
- **Plans:** BASIC ($9.99/mo), PREMIUM ($19.99/mo), ELITE ($29.99/mo)
- **Status:** ✅ FULLY INTEGRATED
- **Routes:** `/api/payments/subscribe`, `/api/payments/checkout`, `/api/payments/donate`, `/api/payments/portal`, `/api/payments/connect`, `/api/payments/webhook`

#### 📧 Email (`src/lib/email.ts`)
- **Provider:** Resend
- **Status:** ✅ FULLY INTEGRATED (14 email templates)
- **Exported Functions:**
  - `sendOTPEmail()` — signup verification
  - `sendWelcomeEmail()` — onboarding
  - `sendEventBookingEmail()` — event confirmation
  - `sendEventReminderEmail()` — event countdown
  - `sendWaitlistPromotionEmail()` — waitlist → booking
  - `sendCoachApprovalEmail()` — coach application decision
  - `sendOrderConfirmationEmail()` — purchase confirmation
  - `sendSubscriptionEmail()` — subscription status
  - `sendPayoutEmail()` — coach earnings payout
  - `sendDonationReceivedEmail()` — donation thank you
  - `sendStreamNotificationEmail()` — live stream alerts
  - `sendReferralRewardEmail()` — referral bonuses
  - `sendSupportEmail()` — support ticket submission
  - `sendSupportConfirmationEmail()` — support response
  - `sendAccountStatusEmail()` — account updates

#### 📺 Live Streaming (`src/lib/ivs.ts`)
- **Provider:** Amazon IVS
- **Status:** ✅ FULLY INTEGRATED
- **Exported Functions:**
  - `createIvsChannel(name)` — create broadcast channel
  - `deleteIvsChannel(channelArn)` — cleanup
  - `getIvsStream(channelArn)` — get live stats (viewer count, health)
  - `stopStream(channelArn)` — end broadcast
  - `getChannelInfo(channelArn)` — channel metadata
- **UI Integration:** Coach streaming page (/coach/streaming) with OBS credentials

#### 💬 Chat & Calls (`src/lib/quickblox.ts`)
- **Provider:** QuickBlox
- **Status:** ⚠️ CONFIGURED BUT NOT WIRED
- **Implemented Functions:**
  - `createAppSession()` — app-level auth
  - `createUserSession(login, password)` — user auth
  - `createUserResource(token, userId, params)` — user management
  - `createGroupChat(token, groupName, members)` — group chat
  - `deleteDialogue(token, dialogueId)` — cleanup
- **Frontend:** Hardcoded fake messages on `/member/messages` and `/coach/messages`
- **TODO:** Replace hardcoded UI with QuickBlox SDK integration

#### 🏃 Wearables (`src/lib/google-fit.ts`)
- **Provider:** Google Fit
- **Status:** ❌ CONFIGURED BUT SDK NOT INTEGRATED
- **Exported Functions:**
  - `getGoogleAuthUrl(state)` — OAuth flow initiation
  - `exchangeCodeForTokens(code)` — token exchange
  - `refreshAccessToken(refreshToken)` — token refresh
  - `fetchSteps(accessToken, startMs, endMs)` — daily step count
  - `fetchCalories(accessToken, startMs, endMs)` — calorie burn
  - `fetchHeartRate(accessToken, startMs, endMs)` — heart rate data
  - `fetchSleep(accessToken, startMs, endMs)` — sleep metrics
- **OAuth Callback:** `/api/wearables/callback`

#### 📁 File Storage (`src/lib/storage.ts`)
- **Provider:** Oracle Cloud Object Storage (S3-compatible)
- **Status:** ⚠️ PARTIALLY WIRED
- **Exported Functions:**
  - `uploadFile(buffer, key, contentType)` — S3 upload
  - `deleteFile(key)` — S3 delete
  - `generateFileKey(folder, filename, userId)` — key generation with timestamps
  - `validateImageFile(file)` — image validation
  - `validateVideoFile(file)` — video validation
  - `validateAudioFile(file)` — audio validation
  - `validateDocFile(file)` — PDF validation
- **Allowed Types:** JPEG, PNG, GIF, WebP, MP4, QuickTime, AVI, WebM, MP3, WAV, OGG, PDF
- **Forms with no upload wiring:**
  - Profile photo upload
  - Workout video upload
  - Certification PDF upload
  - E-book/PDF upload
  - Album cover upload
  - Song audio upload
- **API Route:** `POST /api/upload` (exists but not wired from UI)

#### 📲 API Helpers (`src/lib/api.ts`)
- `getAuthUser(req)` — extract headers injected by middleware
- `requireAuth(req)` — enforce authentication (returns 401)
- `requireAdmin(req)` — enforce admin role (returns 403)
- `requireCoach(req)` — enforce coach role (returns 403)
- `requireRole(req, allowedRoles)` — flexible role enforcement
- **Header Injection:** Middleware adds `x-user-id`, `x-user-role`, `x-tenant-id`

---

## 2️⃣ BACKEND ARCHITECTURE OVERVIEW

### Folder Structure
```
src/
├── app/
│   ├── (auth)/              # Auth layout (login, signup, forgot-password, verify)
│   ├── admin/               # Admin dashboard + 13 pages
│   ├── coach/               # Coach portal + 13 pages
│   ├── member/              # Member app + 17 pages
│   ├── api/
│   │   ├── users/me/stats   # User stats endpoint
│   │   ├── community/       # Posts, comments, likes, saves
│   │   ├── workouts/        # Workout management
│   │   └── (other routes)   # See Q3 for complete list
│   ├── about, privacy, terms # Static pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
│
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── shared/              # Common components (breadcrumbs, onboarding tour)
│   ├── landing/             # Landing page components
│   └── (page-specific)      # Component files for pages
│
├── hooks/
│   ├── use-auto-save.ts     # Auto-save hook
│   ├── use-quickblox-calls.ts  # QuickBlox calls integration
│
├── lib/
│   ├── auth.ts              # Auth helpers
│   ├── stripe.ts            # Stripe integration
│   ├── email.ts             # Resend email templates
│   ├── ivs.ts               # Amazon IVS streaming
│   ├── quickblox.ts         # QuickBlox chat/calls
│   ├── google-fit.ts        # Google Fit wearables
│   ├── storage.ts           # Oracle Cloud Object Storage
│   ├── api.ts               # API request helpers
│   ├── prisma.ts            # Prisma client
│   ├── utils.ts             # Utility functions
│   ├── validations.ts       # Zod validation schemas
│   └── audio-context.ts     # Audio player context
│
├── types/
│   └── index.ts             # TypeScript type definitions
│
├── middleware.ts            # Route protection + auth checks
└── env/
    └── (generated)          # Environment validation

prisma/
├── schema.prisma            # Database schema (30 models)
└── seed.ts                  # Demo data seeding

config/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── components.json          # shadcn/ui config
```

### Database Models (30 total, all with `tenantId`)

**Core:**
- `Tenant` — multi-tenant support
- `User` — authentication (email, password hash, role)
- `UserProfile` — member details (age, height, weight, goals)
- `CoachProfile` — coach details (specialization, certifications)
- `ClientNote` — coach notes on members

**Social:**
- `Post` — community posts
- `Comment` — post comments
- `Like` — post/comment likes
- `Save` — saved posts
- `Follow` — user follows
- `WorkoutRequest` — member → coach requests
- `Group` — community groups
- `GroupMember` — group membership

**Fitness:**
- `WorkoutPlan` — coached workouts
- `Exercise` — plan exercises
- `WorkoutSession` — completion tracking
- `SessionExercise` — completed exercises
- `Goal` — fitness goals

**Content:**
- `Album` — music albums
- `Song` — track listing
- `Playlist` — user playlists
- `PlaylistSong` — playlist contents
- `Book` — e-books/resources
- `Category` — content categorization

**Events:**
- `Event` — fitness events
- `EventBooking` — RSVP + waitlist
- `Stream` — live stream metadata

**Commerce:**
- `Product` — shop items
- `CartItem` — shopping cart
- `Order` — purchase history
- `OrderItem` — order line items
- `Subscription` — plan subscriptions
- `Donation` — coach donations
- `AffiliateLink` — referral links

**Admin:**
- `Questionnaire` — onboarding questions
- `CmsPage` — dynamic page content
- `Notification` — in-app notifications
- `Report` — content moderation reports
- `Block` — blocked users

**Gamification:**
- `Challenge` — fitness challenges
- `ChallengeParticipant` — challenge entries

### API Endpoints (76 total across 3 API folders)

**Users API:** `src/app/api/users/`
- `GET /api/users/me` — authenticated user profile
- `GET /api/users/me/stats` — user statistics (workouts, streak, etc.)
- Additional endpoints for profile CRUD (not fully listed)

**Community API:** `src/app/api/community/`
- Post CRUD (create, read, update, delete)
- Comment CRUD
- Like/unlike posts
- Save/unsave posts
- User follow/unfollow

**Workouts API:** `src/app/api/workouts/`
- Workout plan CRUD
- Exercise management
- Session tracking
- Filtering and search

**Payments API:** (inferred from BUILD_LOG)
- `POST /api/payments/subscribe` — start subscription
- `POST /api/payments/checkout` — shop checkout
- `POST /api/payments/donate` — send donation
- `GET /api/payments/portal` — Stripe customer portal
- `POST /api/payments/connect` — coach Stripe Connect
- `POST /api/payments/webhook` — Stripe events

**File Upload API:**
- `POST /api/upload` — file upload endpoint

### Authentication Flow
1. **Signup:** User enters email → OTP sent via Resend → verify → create password → create User record
2. **Login:** Email + password → validate → create JWT session → redirect to role-based dashboard
3. **Middleware:** Extracts cookies (`gymtality_auth`, `gymtality_role`) → injects headers for backend
4. **Protected Routes:** Middleware checks auth before rendering pages
5. **Role-Based Access:**
   - `/member/*` → requires MEMBER role
   - `/coach/*` → requires COACH role
   - `/admin/*` → requires ADMIN/OWNER role

### Third-Party Service Architecture

```
Frontend (Next.js)
├── Stripe SDK (client-side)
│   └── /api/payments/* routes
│
├── Resend API (server-side)
│   └── Email notifications
│
├── Amazon IVS SDK
│   └── Coach streaming, live stats
│
├── QuickBlox SDK
│   └── Chat/calls (HARDCODED UI, not integrated)
│
├── Google Fit OAuth
│   └── Wearable sync (configured, not integrated)
│
├── Oracle Cloud Object Storage (S3-compatible)
│   └── File uploads
│
└── NextAuth.js (missing—using manual JWT)
    └── Session management
```

---

## 3️⃣ AUTHENTICATION SYSTEM CHECK

### Current Implementation
- **Type:** Manual JWT + NextAuth.js 5 beta (partially configured)
- **Session Storage:** Zustand (client-side) + localStorage
- **Persistence:** `localStorage["gymtality-auth"]` contains user object and JWT

### Login Flow
1. User navigates to `/login`
2. Submits email + password
3. Backend validates credentials
4. Backend returns JWT + user object
5. Frontend stores in Zustand (persisted to localStorage)
6. Middleware reads `gymtality_auth` cookie and `gymtality_role` cookie
7. On protected routes, redirects to `/login` if not authenticated

### Signup Flow
1. User navigates to `/signup`
2. Selects role (MEMBER or COACH)
3. Enters: fullName, username, email, password, confirmPassword
4. Submits → backend sends OTP to email
5. User navigates to `/verify` → enters OTP
6. On OTP verification, user account created
7. Auto-login occurs → redirect to questionnaire or dashboard

### Token Handling
- **JWT Secret:** Stored in `NEXTAUTH_SECRET` (production: on server)
- **Session Duration:** No expiration configured (TODO)
- **Token Refresh:** Manual refresh function exists in `google-fit.ts` but not used for primary auth

### User Session Structure
```typescript
interface SessionUser {
  id: string;
  tenantId: string;
  email: string;
  username: string;
  fullName: string;
  profilePhoto: string | null;
  role: UserRole;  // MEMBER | COACH | ADMIN | OWNER | GUEST
}
```

### Forgot Password Flow
1. User lands on `/forgot-password`
2. Enters email → backend sends OTP
3. User navigates to verify page (same as signup OTP)
4. Enters OTP → confirms → sets new password
5. Returns to login page

### Middleware Auth Guards
**File:** `src/middleware.ts`
- Public routes (no auth required): `/`, `/login`, `/signup`, `/verify`, `/forgot-password`, `/about`, `/privacy`, `/terms`, `/audio`
- Protected routes redirect to `/login` if `gymtality_auth` cookie missing
- Guest role can only access `/member` pages (read-only)
- Guests blocked from: `/admin`, `/coach`, `/member/settings`, `/member/profile`, `/member/messages`
- Role-based route guards:
  - `/admin/*` → requires ADMIN, OWNER, or SUPER_ADMIN
  - `/coach/*` → requires COACH, ADMIN, OWNER, or SUPER_ADMIN

### Issues Found
- ❌ No token expiration configured
- ❌ NextAuth.js setup incomplete (manual JWT used instead)
- ❌ No logout implementation visible
- ❌ No password reset email flow (OTP only)
- ❌ No two-factor authentication
- ⚠️ JWT stored in localStorage (XSS vulnerable)

---

## 4️⃣ PAYMENTS INTEGRATION CHECK

### Stripe Implementation Status: ✅ FULLY INTEGRATED

#### Subscription Plans
```javascript
{
  BASIC: {
    name: "Basic",
    monthlyPrice: 999,      // $9.99/mo
    yearlyPrice: 9990,      // $99.90/yr
    features: [
      "Access to workout library",
      "Community access",
      "Event booking",
      "Basic analytics"
    ]
  },
  PREMIUM: {
    name: "Premium",
    monthlyPrice: 1999,     // $19.99/mo
    yearlyPrice: 19990,     // $199.90/yr
    features: [
      "Everything in Basic",
      "Live streaming access",
      "1:1 coach messaging",
      "Music library",
      "Advanced analytics"
    ]
  },
  ELITE: {
    name: "Elite",
    monthlyPrice: 3999,     // $39.99/mo
    yearlyPrice: 39990,     // $399.90/yr
    features: [
      "Everything in Premium",
      "Priority event booking",
      "Personal training sessions",
      "Exclusive content",
      "Wearable integration"
    ]
  }
}
```

#### Stripe API Functions
```typescript
getOrCreateCustomer(email, name, userId)
  // Returns Stripe customer ID, creates if doesn't exist

formatAmountForDisplay(amount)
  // Converts cents to $X.XX format
```

#### Wired Flows
1. **Subscription:** Member selects plan → checkout → Stripe payment → webhook creates subscription
2. **Shop Checkout:** Add items to cart → checkout with shipping → Stripe payment
3. **Donations:** Member donates to coach → Stripe Payment Intent → coach receives funds
4. **Coach Payouts:** Coach earnings in app → Stripe Connect withdrawal
5. **Customer Portal:** Stripe-hosted portal for managing billing

#### Webhook Events Handled
- `checkout.session.completed` — subscription/order creation
- `invoice.payment_succeeded` — payment captured
- `payment_intent.succeeded` — donation captured

#### Credentials
- ✅ `STRIPE_SECRET_KEY` (test mode)
- ✅ `STRIPE_PUBLISHABLE_KEY` (public)
- ✅ `STRIPE_WEBHOOK_SECRET` (webhook signing)

#### TODO
- [ ] Register webhook URL in Stripe dashboard: `https://gymtality.fit/api/payments/webhook`
- [ ] Enable live mode with production keys
- [ ] Set up Stripe Connect for coach payouts
- [ ] Configure refund handling in webhook

#### UI Wiring Status
- ✅ Member Shop (`/member/shop`) — wired to Stripe checkout
- ✅ Subscriptions view — wired to plan selection
- ⚠️ Member Donations (`/member/donations`) — form exists, Stripe flow not wired
- ⚠️ Coach Donations (`/coach/donations`) — form exists, not wired
- ✅ Coach Earnings (`/coach/earnings`) — wired to Stripe Connect

---

## 5️⃣ MEDIA & MUSIC SYSTEM

### Current Status
- **Music:** ✅ Database models + basic UI
- **Video:** ⚠️ Streaming integrated (IVS), VOD not wired
- **Uploads:** ⚠️ Upload infrastructure ready, forms not wired

### Music System

#### Database Models
- **Album** — collection of songs
- **Song** — track with metadata (artist, duration, genre)
- **Playlist** — member-created collections
- **PlaylistSong** — join table for playlists

#### Seed Data
- 4 albums with 21 songs total
- Demo artists and genres

#### UI Components
- **Member Music Page:** `/member/music`
  - Browse albums
  - View songs
  - Create/edit playlists
  - Play songs
  - Full music player at bottom (logo: `🎵`)
- **Landing Page Audio:** `/member/landing-audio`
  - Demo music player with rotating track
  - Uses `audio-context.ts` for state management
- **Admin Music Management:** `/admin/cms` (music tab)
  - Upload albums and songs
  - **TODO:** Wire file upload to Oracle Cloud

#### Music Player Features
- Play/pause
- Next/previous track
- Progress bar
- Volume control
- Duration display
- Current track display
- Playlist support

#### Upload Flow (not wired)
1. Form exists on admin CMS page
2. File validation configured in `storage.ts` (ALLOWED_AUDIO_TYPES)
3. `POST /api/upload` endpoint ready
4. Forms don't call upload API yet

### Video/Streaming System

#### Integrated: Amazon IVS
- **Live Streaming:** Coach goes live via OBS
- **Viewer Page:** Members watch live stream
- **Viewer Count:** Real-time viewer statistics
- **Recording:** VOD not configured

#### Pages
- **Coach Streaming:** `/coach/streaming`
  - OBS stream key and ingest endpoint
  - Start/stop streaming controls
  - Real-time viewer count and health
- **Member Streaming:** `/member/streaming`
  - Browse live streams
  - Watch stream in full page
  - View stream metadata

#### Stream Metadata Stored
- IVS channel ARN
- Stream key
- Playback URL
- Ingest endpoint
- Viewer count
- Health status

### Video Upload (not wired)
- **Intended Flow:** Coach uploads workout video → stored in Oracle Cloud → playable on demand
- **Current Status:** Upload form exists on `/coach/content` but doesn't call upload API
- **Infrastructure:** `storage.ts` has video validation (MP4, QuickTime, AVI, WebM)
- **TODO:** Wire upload form to `/api/upload` endpoint

---

## 6️⃣ FRONTEND-TO-BACKEND API MAPPING

### Member App Pages & API Calls

| Page | Route | API Called | Status |
|------|-------|-----------|--------|
| Dashboard | `/member/dashboard` | `GET /api/users/me/stats` | ✅ Wired |
| Workouts | `/member/workouts` | `GET /api/workouts`, filtering/search | ✅ Wired |
| Community | `/member/community` | `GET/POST /api/community/posts`, likes, comments | ✅ Wired |
| Events | `/member/events` | `GET /api/events`, booking API | ✅ Wired |
| Music | `/member/music` | `GET /api/music/albums`, playlists | ✅ Wired |
| Streaming | `/member/streaming` | `GET /api/streams`, IVS playback | ✅ Wired |
| Shop | `/member/shop` | `GET /api/products`, Stripe checkout | ✅ Wired |
| Goals | `/member/goals` | `GET/POST /api/goals` | ✅ Wired |
| Activity | `/member/activity` | `GET /api/workouts/sessions` | ✅ Wired |
| Profile | `/member/profile` | `GET/PUT /api/users/{id}` | ✅ Wired |
| Questionnaire | `/member/questionnaire` | `POST /api/questionnaire` | ✅ Wired |
| Messages | `/member/messages` | QuickBlox SDK | ❌ Hardcoded |
| Explore | `/member/explore` | `GET /api/search` (cross-content) | ❌ Not wired |
| Referrals | `/member/referrals` | `POST /api/referrals/generate` | ❌ Not wired |
| Settings | `/member/settings` | `PUT /api/users/settings` | ❌ Not wired |
| Support | `/member/support` | `POST /api/support/ticket` | ❌ Stub |
| Donations | `/member/donations` | Stripe Payment Intent | ❌ Not wired |
| Leaderboard | `/member/leaderboard` | `GET /api/leaderboard` | ⚠️ Partial |
| Badges | `/member/badges` | `GET /api/achievements` | ⚠️ Partial |
| Profile (other users) | `/member/profile/[id]` | `GET /api/users/{id}/public` | ⚠️ Partial |

### Coach App Pages & API Calls

| Page | Route | API Called | Status |
|------|-------|-----------|--------|
| Dashboard | `/coach/dashboard` | `GET /api/coach/stats` | ✅ Wired |
| Clients CRM | `/coach/clients` | `GET /api/coach/clients`, client notes | ✅ Wired |
| Earnings | `/coach/earnings` | `GET /api/coach/earnings`, Stripe Connect | ✅ Wired |
| Streaming | `/coach/streaming` | IVS API, create channel | ✅ Wired |
| Content Upload | `/coach/content` | `POST /api/upload` | ❌ Not wired |
| Schedule | `/coach/schedule` | `GET/POST /api/coach/schedule` | ❌ Not wired |
| Settings | `/coach/settings` | `PUT /api/coach/profile` | ❌ Not wired |
| Videos | `/coach/videos` | `GET /api/coach/videos` | ❌ Stub |
| Donations | `/coach/donations` | `GET /api/coach/donations` | ❌ Stub |
| Notifications | `/coach/notifications` | `GET /api/coach/notifications` | ❌ Stub |
| Reports | `/coach/reports` | `GET /api/coach/reports` | ❌ Stub |
| Messages | `/coach/messages` | QuickBlox SDK | ❌ Hardcoded |
| Help | `/coach/help` | Stub page | ❌ Stub |
| Music Bookings | `/admin/music-bookings` | `GET /api/music-bookings` | ⚠️ Partial |

### Admin Portal Pages & API Calls

| Page | Route | API Called | Status |
|------|-------|-----------|--------|
| Dashboard | `/admin/dashboard` | `GET /api/admin/stats`, charts | ✅ Wired |
| Users | `/admin/users` | `GET/PUT /api/admin/users`, block/unblock | ✅ Wired |
| Coaches | `/admin/coaches` | `GET /api/admin/coaches/pending`, approve/deny | ✅ Wired |
| Analytics | `/admin/analytics` | `GET /api/admin/analytics` | ✅ Wired |
| Subscriptions | `/admin/subscriptions` | `GET /api/admin/subscriptions` | ✅ Wired |
| Moderation | `/admin/moderation` | `GET /api/admin/reports`, resolve | ✅ Wired |
| Questionnaire | `/admin/questionnaire` | `GET/POST /api/questionnaire` | ✅ Wired |
| Content CMS | `/admin/cms` | Partial (music tab only) | ⚠️ Partial |
| Events | `/admin/events` | `POST /api/admin/events` | ❌ Not wired |
| Commerce | `/admin/commerce` | `POST /api/admin/products` | ❌ Not wired |
| CMS Pages | `/admin/cms` | `PUT /api/cms-pages` | ❌ Not wired |
| Settings | `/admin/settings` | `PUT /api/admin/tenant` | ❌ Not wired |
| Reports | `/admin/reports` | `GET /api/admin/reports` | ❌ Stub |
| Diet | `/admin/diet` | `GET /api/diet` | ⚠️ Partial |
| Goals | `/admin/goals` | `GET /api/goals` | ⚠️ Partial |

### API Response Format
All endpoints follow:
```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string
}
```

---

## 7️⃣ AI FEATURES CHECK

### Current Status: ❌ NO AI INTEGRATIONS

### Checked Locations
- ✅ Scanned all service libraries (`src/lib/*.ts`)
- ✅ Scanned API routes (`src/app/api/**`)
- ✅ Checked environment variables (`.env`)
- ✅ Searched codebase for OpenAI, Anthropic, replicate, huggingface

### No Evidence Of
- Claude API integration
- OpenAI integration
- LLM-based features
- AI-powered personalization
- Automated content generation
- ML-based recommendations

### Could Be Implemented
- **Workout Recommendations:** Based on user goals, activity history
- **Nutrition Plans:** Based on questionnaire answers
- **Content Tagging:** Auto-tag music, videos by genre/mood
- **Progress Insights:** Natural language analysis of user progress
- **Moderation:** Auto-filter inappropriate community posts
- **Chatbot:** AI coach assistant in chat

---

## 8️⃣ DATABASE STRUCTURE

### Database Type: PostgreSQL 14
**Connection:** `postgresql://forge:password@localhost:5432/forge_fitness`

### Schema Overview (30 Models)

#### 1. Multi-Tenancy
```prisma
model Tenant {
  id String @id @default(cuid())
  name String
  slug String @unique
  logo String?
  primaryColor String @default("#FF6B00")
  accentColor String @default("#1A1A2E")
  favicon String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  users User[]
  posts Post[]
  // ... all models have tenantId foreign key
}
```

#### 2. Authentication
```prisma
model User {
  id String @id @default(cuid())
  tenantId String
  email String @unique
  username String @unique
  fullName String
  password String (bcrypted)
  profilePhoto String?
  role UserRole (MEMBER | COACH | ADMIN | OWNER | GUEST)
  isActive Boolean @default(true)
  isBlocked Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  profile UserProfile?
  coachProfile CoachProfile?
  // ... relations
}

model UserProfile {
  id String @id
  userId String @unique
  age Int?
  gender String?
  dob DateTime?
  height Float?
  weight Float?
  activityLevel String?
  dietPreference String?
  // ... fitness data
}

model CoachProfile {
  id String @id
  userId String @unique
  specialization String[]
  certifications String[]
  bio String?
  hourlyRate Int?
  // ... coach data
}
```

#### 3. Social Features
```prisma
model Post {
  id String @id
  tenantId String
  userId String
  content String
  imageUrl String?
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  comments Comment[]
  likes Like[]
  saves Save[]
}

model Comment {
  id String @id
  tenantId String
  postId String
  userId String
  text String
  createdAt DateTime @default(now())
  
  post Post @relation(fields: [postId], references: [id])
  user User @relation(fields: [userId], references: [id])
}

model Like {
  id String @id
  tenantId String
  postId String
  userId String
  createdAt DateTime @default(now())
  
  post Post @relation(fields: [postId], references: [id])
  user User @relation(fields: [userId], references: [id])
}

model Save {
  id String @id
  tenantId String
  postId String
  userId String
  createdAt DateTime @default(now())
  
  post Post @relation(fields: [postId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
```

#### 4. Fitness/Workouts
```prisma
model WorkoutPlan {
  id String @id
  tenantId String
  coachId String
  name String
  description String?
  difficulty String (BEGINNER | INTERMEDIATE | ADVANCED)
  duration Int (minutes)
  createdAt DateTime @default(now())
  
  coach User @relation(fields: [coachId], references: [id])
  exercises Exercise[]
  sessions WorkoutSession[]
}

model Exercise {
  id String @id
  tenantId String
  planId String
  name String
  sets Int
  reps Int
  weight Float?
  duration Int?
  notes String?
  
  plan WorkoutPlan @relation(fields: [planId], references: [id])
}

model WorkoutSession {
  id String @id
  tenantId String
  userId String
  planId String
  completedAt DateTime
  
  user User @relation(fields: [userId], references: [id])
  plan WorkoutPlan @relation(fields: [planId], references: [id])
  exercises SessionExercise[]
}

model Goal {
  id String @id
  tenantId String
  userId String
  type String (STRENGTH | ENDURANCE | WEIGHT_LOSS | etc)
  targetValue Float
  currentValue Float
  deadline DateTime
  createdAt DateTime @default(now())
}
```

#### 5. Content/Music
```prisma
model Album {
  id String @id
  tenantId String
  title String
  artist String
  coverUrl String?
  releaseDate DateTime?
  
  songs Song[]
}

model Song {
  id String @id
  tenantId String
  albumId String
  title String
  artist String
  duration Int (seconds)
  audioUrl String
  genre String?
  
  album Album @relation(fields: [albumId], references: [id])
  playlistSongs PlaylistSong[]
}

model Playlist {
  id String @id
  tenantId String
  userId String
  name String
  
  user User @relation(fields: [userId], references: [id])
  songs PlaylistSong[]
}

model Book {
  id String @id
  tenantId String
  title String
  author String
  pdfUrl String
  category String?
}
```

#### 6. Events
```prisma
model Event {
  id String @id
  tenantId String
  coachId String
  title String
  description String?
  dateTime DateTime
  capacity Int
  cost Int? (cents)
  
  coach User @relation(fields: [coachId], references: [id])
  bookings EventBooking[]
}

model EventBooking {
  id String @id
  tenantId String
  eventId String
  userId String
  status String (BOOKED | WAITLISTED | CANCELLED)
  createdAt DateTime @default(now())
  
  event Event @relation(fields: [eventId], references: [id])
  user User @relation(fields: [userId], references: [id])
}

model Stream {
  id String @id
  tenantId String
  coachId String
  title String
  channelArn String (IVS)
  streamKey String
  playbackUrl String
  isLive Boolean @default(false)
  viewerCount Int @default(0)
  createdAt DateTime @default(now())
}
```

#### 7. E-Commerce
```prisma
model Product {
  id String @id
  tenantId String
  name String
  description String?
  price Int (cents)
  imageUrl String?
  stock Int
  
  cartItems CartItem[]
  orderItems OrderItem[]
}

model CartItem {
  id String @id
  tenantId String
  userId String
  productId String
  quantity Int
  
  user User @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])
}

model Order {
  id String @id
  tenantId String
  userId String
  stripeCheckoutId String
  total Int (cents)
  status String (PENDING | COMPLETED | REFUNDED)
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
  items OrderItem[]
}

model Subscription {
  id String @id
  tenantId String
  userId String
  plan String (BASIC | PREMIUM | ELITE)
  stripeSubscriptionId String
  status String (ACTIVE | CANCELLED | EXPIRED)
  renewalDate DateTime
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}

model Donation {
  id String @id
  tenantId String
  fromUserId String
  coachId String
  amount Int (cents)
  stripePaymentIntentId String
  createdAt DateTime @default(now())
}
```

#### 8. Admin/CMS
```prisma
model Questionnaire {
  id String @id
  tenantId String
  question String
  type String (TEXT | MULTIPLE_CHOICE | RANGE)
  options String[]
  required Boolean
  
  userResponses QuestionnaireResponse[]
}

model CmsPage {
  id String @id
  tenantId String
  slug String @unique
  title String
  content String (rich text / markdown)
  publishedAt DateTime?
  
  seo {
    metaTitle String?
    metaDescription String?
    keywords String[]?
  }
}

model Notification {
  id String @id
  tenantId String
  userId String
  type String (EVENT | MESSAGE | ACHIEVEMENT | etc)
  message String
  read Boolean @default(false)
  createdAt DateTime @default(now())
}

model Report {
  id String @id
  tenantId String
  reportedUserId String
  reporterUserId String
  reason String
  description String?
  status String (PENDING | REVIEWED | RESOLVED)
  createdAt DateTime @default(now())
}

model Block {
  id String @id
  tenantId String
  userId String
  blockedUserId String
  reason String?
  createdAt DateTime @default(now())
}
```

#### 9. Gamification
```prisma
model Challenge {
  id String @id
  tenantId String
  name String
  description String?
  startDate DateTime
  endDate DateTime
  goal Int
  
  participants ChallengeParticipant[]
}

model ChallengeParticipant {
  id String @id
  tenantId String
  challengeId String
  userId String
  progress Int @default(0)
  
  challenge Challenge @relation(fields: [challengeId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
```

### Relationships Summary
- 1 Tenant : Many Users
- 1 User : 1 UserProfile
- 1 User : 1 CoachProfile
- 1 Coach : Many WorkoutPlans
- 1 Coach : Many Events
- 1 Coach : Many Streams
- 1 User : Many Goals
- 1 User : Many Posts
- 1 Post : Many Comments
- 1 User : Many Playlists
- 1 Album : Many Songs
- 1 Playlist : Many PlaylistSongs
- 1 Event : Many EventBookings
- 1 User : Many Subscriptions
- 1 User : Many Orders
- All models: `tenantId` foreign key

### Seed Data Deployed
- 16 demo users (admins, coaches, members, guests)
- 6 workout plans with exercises
- 8 events with bookings
- 4 albums with 21 songs
- 10 products
- 5 live streams
- 8 fitness goals
- 10 active subscriptions
- More data in other tables

---

## 9️⃣ NOTIFICATIONS & ENGAGEMENT

### Notification System

#### Email Notifications (Resend)
All triggered automatically via service functions in `src/lib/email.ts`:

1. **OTP & Auth**
   - `sendOTPEmail(to, otp)` — signup/forgot password verification code
   - `sendWelcomeEmail(to, name)` — account creation confirmation

2. **Events**
   - `sendEventBookingEmail(to, name, eventName, dateTime)` — RSVP confirmation
   - `sendEventReminderEmail(to, name, eventName, hoursUntil)` — event countdown (24h before)
   - `sendWaitlistPromotionEmail(to, name, eventName)` — waitlisted → booked

3. **Coaching**
   - `sendCoachApprovalEmail(to, name, approved)` — coach application decision (approved/rejected)

4. **Commerce**
   - `sendOrderConfirmationEmail(to, name, orderNumber, items, total)` — purchase receipt
   - `sendSubscriptionEmail(to, name, plan, status)` — subscription activated/cancelled

5. **Earnings & Donations**
   - `sendPayoutEmail(to, name, amount)` — coach earnings payout confirmation
   - `sendDonationReceivedEmail(to, donorName, amount)` — donation thank you

6. **Social**
   - `sendStreamNotificationEmail(to, name, coachName)` — coach is live now
   - `sendReferralRewardEmail(to, name, rewardAmount)` — referral bonus earned

7. **Support**
   - `sendSupportEmail(to, name, subject, message)` — support ticket submission
   - `sendSupportConfirmationEmail(to, name, subject)` — support team response

8. **Account**
   - `sendAccountStatusEmail(to, name, status, reason)` — account blocked/unblocked

#### In-App Notifications
- **Model:** `Notification` table stores all events
- **Types:** EVENT, MESSAGE, ACHIEVEMENT, SYSTEM, COACHING
- **Delivery:** Typically in-app bell icon + email fallback
- **Status:** Mark as read when viewed

#### Push Notifications
- **Status:** ❌ NOT IMPLEMENTED
- **Infrastructure:** Not set up yet
- **Could Use:** OneSignal, Firebase Cloud Messaging, or native Web Push

#### Engagement Features Implemented
- **Streak Counter:** Tracks consecutive workout days
- **Leaderboard:** Ranked by workouts, achievements
- **Badges:** Gamified achievements (first workout, 10-day streak, etc.)
- **Challenges:** Community-wide fitness challenges
- **Goals:** Personal goal tracking with progress
- **Social Features:** Posts, comments, likes, follows
- **Events:** Group fitness events with booking

#### Engagement Features TODO
- [ ] Email digest (weekly activity summary)
- [ ] Notification preferences per user
- [ ] Push notifications
- [ ] Milestone celebrations (50th workout, etc.)
- [ ] Friend activity feed
- [ ] Coach recommendation algorithm

### Notification Flow Example (Event Booking)
```
Member books event
  → EventBooking created in DB
  → Background job triggers
  → sendEventBookingEmail() called
  → Email sent via Resend
  → In-app Notification created
  → Member sees bell icon + email in inbox
```

---

## 🔟 SYSTEM MAP & DATA FLOW

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GYMTALITY ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER (Browser)                                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Member App              Coach App             Admin Portal           │
│  ├─ Dashboard            ├─ Dashboard          ├─ Dashboard           │
│  ├─ Workouts             ├─ Clients            ├─ Users               │
│  ├─ Community Posts      ├─ Earnings           ├─ Coaches             │
│  ├─ Events & Booking     ├─ Streaming (IVS)    ├─ Analytics           │
│  ├─ Music Player         ├─ Content Upload     ├─ Moderation          │
│  ├─ Streaming Watch      ├─ Schedule           ├─ CMS                 │
│  ├─ Shop & Checkout      ├─ Messages (QB)      ├─ Settings            │
│  ├─ Goals & Activity     └─ Earnings           └─ Reports             │
│  ├─ Referrals                                                          │
│  └─ Settings                                                           │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
                                ↓
                  (Browser API calls via fetch)
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js 15 on https://gymtality.fit)                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Middleware (src/middleware.ts)                                       │
│  ├─ Auth guard (check cookie, redirect to /login)                    │
│  ├─ Role-based routing (/admin, /coach, /member)                     │
│  └─ Inject x-user-id, x-user-role, x-tenant-id headers              │
│                                                                        │
│  API Routes (src/app/api/*)                                           │
│  ├─ /users/me/stats          → fetch user metrics from backend       │
│  ├─ /community/*             → posts, comments, likes                 │
│  ├─ /workouts/*              → plans, exercises, sessions             │
│  ├─ /payments/*              → Stripe integration                     │
│  └─ /upload                  → Oracle Cloud file storage              │
│                                                                        │
│  Service Libraries (src/lib/*)                                        │
│  ├─ stripe.ts                → Stripe SDK for payments                │
│  ├─ email.ts                 → Resend for transactional emails        │
│  ├─ ivs.ts                   → AWS IVS for live streaming             │
│  ├─ quickblox.ts             → QuickBlox chat/calls (hardcoded UI)    │
│  ├─ google-fit.ts            → Google Fit OAuth (not integrated)      │
│  ├─ storage.ts               → Oracle Cloud S3-compatible uploads     │
│  └─ auth.ts                  → Auth helpers & role checks             │
│                                                                        │
│  State Management (Zustand + localStorage)                            │
│  └─ User session, auth token, theme, preferences                     │
│                                                                        │
│  UI Components (shadcn/ui + Tailwind CSS)                             │
│  └─ Buttons, forms, modals, cards, etc.                              │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
                                ↓
        ┌───────────────────────┴────────────────────────┐
        ↓                                                 ↓
┌──────────────────────┐                    ┌─────────────────────────┐
│ USER BACKEND API     │                    │ EXTERNAL SERVICES       │
│ (Not in this repo)   │                    │                         │
├──────────────────────┤                    ├─────────────────────────┤
│                      │                    │                         │
│ Node.js/Express      │                    │ Stripe 🔗               │
│ https://api.         │  ← → Database      │ ├─ Subscriptions        │
│ gymtality.fit        │      PostgreSQL    │ ├─ Payments             │
│                      │                    │ └─ Connect (payouts)    │
│ Endpoints:           │                    │                         │
│ ├─ /auth/*           │                    │ Resend Email 📧         │
│ ├─ /users/*          │                    │ ├─ OTP                  │
│ ├─ /workouts/*       │                    │ ├─ Confirmations        │
│ ├─ /posts/*          │                    │ └─ Notifications        │
│ ├─ /events/*         │                    │                         │
│ ├─ /coaches/*        │                    │ AWS IVS Streaming 📹    │
│ ├─ /subscriptions/*  │                    │ ├─ Create channels      │
│ ├─ /orders/*         │                    │ ├─ Stream keys          │
│ └─ /admin/*          │                    │ └─ Viewer stats         │
│                      │                    │                         │
└──────────────────────┘                    │ QuickBlox Chat 💬       │
                                            │ ├─ Messages (hardcoded) │
         ↓                                   │ └─ Calls (not integrated)
                                            │                         │
         Database                           │ Google Fit Wearables ⌚  │
         ├─ Users (auth)                    │ ├─ OAuth (configured)   │
         ├─ Profiles (personal data)        │ └─ Sync (not integrated)│
         ├─ Posts (community)               │                         │
         ├─ Workouts (fitness plans)        │ Oracle Cloud Storage 🗂️ │
         ├─ Events (bookings)               │ └─ File uploads (photos,│
         ├─ Music (albums, songs)           │    videos, audio)       │
         ├─ Products (shop)                 │                         │
         ├─ Orders (purchases)              │ NextAuth.js 🔐          │
         ├─ Subscriptions                   │ ├─ JWT generation       │
         ├─ Subscriptions                   │ └─ Session management   │
         ├─ Goals (fitness tracking)        │                         │
         ├─ Challenges (gamification)       │ Analytics (future)      │
         └─ Notifications                   │ ├─ Google Analytics     │
                                            │ └─ Mixpanel             │
                                            │                         │
                                            └─────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ DEPLOYMENT INFRASTRUCTURE                                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ Domain:   gymtality.fit (GoDaddy) → Oracle Cloud VPS IP              │
│ Server:   Oracle Cloud Free Tier VPS (Ubuntu 22.04)                  │
│ ├─ IP:    167.234.214.60                                             │
│ ├─ SSL:   Let's Encrypt (auto-renews)                                │
│ ├─ Nginx: Reverse proxy on port 443 (HTTPS)                          │
│ ├─ Node.js: v20                                                       │
│ ├─ PostgreSQL: v14 (database)                                         │
│ └─ PM2:   Process manager for app lifecycle                          │
│                                                                        │
│ Deployment Process:                                                   │
│ git push main → GitHub CI/CD → SSH to server                         │
│ → npm install → npm run build → pm2 restart → live on gymtality.fit  │
│                                                                        │
│ Build Command: NODE_OPTIONS="--max-old-space-size=4096" npm run build│
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### Critical Data Flow Examples

#### 1. Workout Booking
```
Member clicks "Book Event"
  → UI calls POST /api/events/{id}/book
  → Backend creates EventBooking record
  → Backend triggers email job
  → sendEventBookingEmail() sends confirmation
  → Notification created in DB
  → Frontend shows confirmation toast
```

#### 2. Subscription Purchase
```
Member selects plan (BASIC/PREMIUM/ELITE)
  → UI calls POST /api/payments/subscribe
  → Backend creates Stripe session
  → Frontend redirects to Stripe checkout.com
  → Member pays on Stripe
  → Stripe webhook hits /api/payments/webhook
  → Backend creates Subscription record
  → Email confirmation sent
  → Member sees "Active Subscription" on dashboard
```

#### 3. Coach Live Stream
```
Coach goes to /coach/streaming
  → UI displays IVS channel ARN, stream key
  → Coach starts OBS stream
  → ivs.ts getIvsStream() polls viewer count
  → Real-time viewer count updates every 2s
  → Members see stream on /member/streaming
  → Stream stops → notification sent to followers
```

#### 4. File Upload (not yet wired, ready for implementation)
```
Coach uploads workout video
  → UI calls POST /api/upload with FormData
  → Backend receives file
  → storage.ts validateVideoFile() checks type
  → uploadFile() pushes to Oracle Cloud
  → Returns public URL
  → URL saved to database
  → Player loads from CDN
```

---

## 1️⃣1️⃣ WHAT'S BROKEN, INCOMPLETE & NOT SCALABLE

### 🔴 CRITICAL ISSUES

#### 1. Authentication Not Production-Ready
- **Issue:** Manual JWT implementation, NextAuth.js incomplete
- **Impact:** Session management fragile, no token expiration
- **Fix:** Complete NextAuth.js 5 integration with database sessions
- **Effort:** 1-2 days
- **Priority:** P0 (blocks security audit)

#### 2. QuickBlox Chat is Hardcoded
- **Issue:** `/member/messages` and `/coach/messages` have fake conversation UI
- **Impact:** Users can't actually message each other
- **Current:** 10 hardcoded fake messages with random avatars
- **Fix:** Integrate QuickBlox SDK, connect to API
- **Effort:** 3-4 days
- **Priority:** P0 (core feature broken)

#### 3. File Upload Endpoints Not Wired
- **Issue:** Upload infrastructure exists but forms don't call it
- **Impact:** Profile photo, video, audio, ebook upload all fail silently
- **Current:**
  - Profile photo upload form (`/member/settings`, `/coach/settings`) → no API call
  - Workout video upload (`/coach/content`) → no API call
  - Certification upload (`/coach/settings`) → no API call
  - Album cover upload (`/admin/cms`) → no API call
  - Song audio upload (`/admin/cms`) → no API call
  - Ebook/PDF upload (`/admin/cms`) → no API call
- **Fix:** Wire forms to POST `/api/upload`, handle response
- **Effort:** 2-3 days
- **Priority:** P1 (data loss potential)

#### 4. Stripe Webhook Not Registered
- **Issue:** No webhook registered in Stripe dashboard
- **Impact:** Payment confirmations, refunds, invoice updates don't trigger
- **Current:** POST `/api/payments/webhook` exists but Stripe doesn't know to call it
- **Fix:** Register URL in Stripe dashboard with webhook secret
- **Effort:** 30 mins
- **Priority:** P0 (revenue impact)

#### 5. Donations Not Wired
- **Issue:** Donation forms exist but no Stripe integration
- **Current:** `/member/donations` and `/coach/donations` are UI stubs
- **Fix:** Connect forms to Stripe Payment Intent
- **Effort:** 1 day
- **Priority:** P2 (new feature incomplete)

#### 6. Google Fit Wearable Sync Not Integrated
- **Issue:** OAuth configured, SDK not installed
- **Current:** Settings mention wearables but no UI/sync
- **Fix:** Install SDK, implement sync job, wire settings UI
- **Effort:** 3-4 days
- **Priority:** P3 (nice-to-have)

### 🟡 SCALABILITY ISSUES

#### 1. No Pagination on Large Datasets
- **Issue:** Community feed loads all posts, workouts list loads all plans
- **Impact:** Will timeout with 10k+ records
- **Fix:** Implement cursor-based pagination (10-50 items per request)
- **Effort:** 2 days
- **Priority:** P1 (hits at ~1k users)

#### 2. Real-Time Updates Are Polling
- **Issue:** IVS viewer count, messages, notifications all poll every 2-5s
- **Impact:** CPU waste, stale data, poor UX
- **Fix:** WebSocket for messages/notifications, SSE for stats
- **Effort:** 3-4 days
- **Priority:** P1 (poor UX at scale)

#### 3. No Database Indexing Configured
- **Issue:** Queries on userId, coachId, postId, etc. aren't indexed
- **Impact:** Will timeout with 100k+ records
- **Fix:** Add indexes on foreign keys and frequently filtered columns
- **Effort:** 1 day
- **Priority:** P1 (critical at scale)

#### 4. No Caching Strategy
- **Issue:** Every request hits database (no Redis)
- **Impact:** High latency, high DB load
- **Fix:** Redis for session, user data, leaderboard
- **Effort:** 2-3 days
- **Priority:** P1 (latency hits at ~5k concurrent users)

#### 5. Static Stripe Plans
- **Issue:** Plans hardcoded in code, can't change pricing without deploy
- **Impact:** Can't run sales, no A/B testing
- **Fix:** Move plans to database, load at runtime
- **Effort:** 1 day
- **Priority:** P2 (business limitation)

#### 6. No Content Moderation Automation
- **Issue:** Moderation is manual report → admin review
- **Impact:** Toxic content stays up for hours/days
- **Fix:** OpenAI/Claude API for auto-flagging, admin review queue
- **Effort:** 2 days
- **Priority:** P2 (brand risk)

### 🟠 INCOMPLETE FEATURES (Wiring)

| Feature | Status | Wiring | Priority |
|---------|--------|--------|----------|
| Member Settings | Form only | PUT /api/users/settings | P2 |
| Member Referrals | Form only | POST /api/referrals/generate | P2 |
| Member Explore | UI exists | GET /api/search (full-text) | P2 |
| Coach Content Upload | Form only | POST /api/upload | P1 |
| Coach Schedule | Calendar stub | GET/POST /api/coach/schedule | P2 |
| Coach Settings | Form only | PUT /api/coach/profile | P2 |
| Admin Events | Stub | POST /api/admin/events CRUD | P2 |
| Admin Commerce | Form only | POST /api/admin/products validation | P2 |
| Admin CMS Pages | Form only | PUT /api/cms-pages save | P2 |
| Admin Settings | Stub | PUT /api/admin/tenant config | P3 |
| Resend Domain Verification | Not verified | Add CNAME in registrar | P1 |

### 🔵 MISSING FEATURES (Not Started)

- [ ] Two-factor authentication
- [ ] Apple Health integration (iOS users)
- [ ] Weekly email digests
- [ ] Video On Demand (coach replay library)
- [ ] Affiliate commission tracking
- [ ] Refund handling in webhook
- [ ] Per-tenant branding/theming
- [ ] Subdomain routing (white-label)
- [ ] Admin analytics dashboards (real charts)
- [ ] Coach certification verification
- [ ] Waitlist overflow handling
- [ ] Push notifications

### 💥 KNOWN BUGS

1. **Messages Page Hardcoded Data**
   - Fake conversations don't update
   - No real message persistence
   - No typing indicators

2. **IVS Stream Status Stale**
   - Polls every 2s but shows 5-10s delay
   - "OFFLINE" state cached too long

3. **Admin Moderation Empty**
   - No reports appear in queue
   - Backend might not be creating Report records

4. **Leaderboard Not Ranking**
   - Shows user list but not sorted by score
   - Scores not aggregating correctly

5. **Profile Photo Upload Crashes**
   - Form submission succeeds but file not stored
   - No error message to user

### 📊 CODE QUALITY ISSUES

- ❌ No error boundaries in React components
- ❌ No input validation on forms (should use Zod client-side)
- ❌ No loading states on async operations
- ❌ No retry logic on failed API calls
- ❌ No unit tests
- ❌ No E2E tests
- ⚠️ Console.log() left in multiple files
- ⚠️ Magic strings instead of constants (role names, status enums)
- ⚠️ No accessibility (ARIA labels, keyboard nav)

### 🔒 SECURITY ISSUES

- ⚠️ JWT stored in localStorage (XSS vulnerable)
- ⚠️ No CSRF protection visible
- ⚠️ API keys in .env (could be committed)
- ❌ No rate limiting on API routes
- ❌ No input sanitization on richtext (CMS pages, posts)
- ❌ SQL injection risk if raw queries used (Prisma mitigates this)
- ⚠️ No API request validation (use Zod)

### 📈 PERFORMANCE ISSUES

- ⚠️ Bundle size unknown (no build analysis)
- ⚠️ No image optimization (Next.js Image component not used consistently)
- ⚠️ No code splitting by route
- ⚠️ All fonts from CDN (could use system fonts)
- ⚠️ No service worker (no offline support)
- ❌ No database query optimization (no select limiting)

---

## Summary by Category

### ✅ What's Working Well
- Basic user authentication
- Stripe payments
- Email notifications
- IVS live streaming
- Database schema (comprehensive)
- Role-based routing
- Multi-tenant support
- UI components (shadcn/ui + Tailwind)

### ⚠️ What's Partially Done
- QuickBlox (configured, not integrated)
- File uploads (infrastructure ready, forms not wired)
- Google Fit (OAuth ready, SDK not installed)
- Admin features (UI done, some forms not wired)

### ❌ What's Broken or Missing
- Chat/messaging (hardcoded)
- Wearable sync (not integrated)
- Donations (not wired)
- 6+ form pages (not saving to API)
- Security hardening
- Performance optimization
- Testing
- Moderation automation

### 🚀 Recommended Next Steps
1. **P0:** Complete authentication (NextAuth.js)
2. **P0:** Register Stripe webhook
3. **P1:** Wire remaining form pages to APIs (chat, donations, file upload)
4. **P1:** Add database indexes, pagination, caching
5. **P2:** Complete QuickBlox integration
6. **P3:** Add Google Fit, wearables

---

## Document Info
**Total Pages:** ~15 (formatted)
**Time to Review:** 30-45 minutes
**Questions Covered:** All 11 + bonus audit
**Last Updated:** 2026-05-04 14:30 UTC
