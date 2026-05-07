# GYMTALITY — Developer Reference

A full-stack fitness platform (formerly Forge Fitness) connecting coaches with members. Three apps: **Member**, **Coach**, and **Admin**. Post-launch, the platform will be white-labeled and sold to gym owners, studios, and corporate wellness businesses.

**Project root:** `c:/Users/Urban Inspiration NW/OneDrive/Desktop/FORGE FITNESS/forge-fitness/`
**Live URL:** https://gymtality.fit
**Build log & PRD:** See `BUILD_LOG.md` for feature status, integrations, and gap analysis.
**Audit findings:** See `PARKING_LOT.md` for bugs, hardcoded data, and orphaned routes.
**Sprint tracker:** See `STATUS.md` for current sprint progress and timeline.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | PostgreSQL + Prisma 7.5 ORM |
| Auth | NextAuth.js 5 beta (JWT, role-based) |
| Hosting | Oracle Cloud VPS (Ubuntu 22.04) |
| Payments | Stripe |
| Chat | QuickBlox (REST API) |
| Streaming | Amazon IVS |
| Email | Resend |
| File Storage | Oracle Cloud Object Storage (S3-compatible) |
| Wearables | Google Fit API |

---

## Architecture Rules

1. Every database model must include `tenantId` for multi-tenancy
2. All API routes return `{ success: boolean, data?: T, error?: string }`
3. Middleware (`src/middleware.ts`) injects `x-user-id`, `x-user-role`, `x-tenant-id` headers — never import Prisma in middleware (Edge runtime)
4. Role-based routing: `/member/*`, `/coach/*`, `/admin/*`
5. Never remove existing features — only add

---

## Build & Deploy

```bash
# Local build
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# SSH to server
ssh -i "C:\Users\Urban Inspiration NW\Downloads\ssh-key-2026-03-17.key" ubuntu@167.234.214.60

# Rebuild + restart on server
cd /home/ubuntu/forge-fitness && NODE_OPTIONS="--max-old-space-size=4096" npm run build && pm2 restart forge-fitness

# Logs
pm2 logs forge-fitness
```

**Server:** Oracle Cloud Free Tier VPS | Node.js 20 | PostgreSQL 14 | Nginx | PM2
**Database:** `forge_fitness` (user: `forge`)
**GitHub:** CultivateCurrency/FORGE-FITNESS

---

## Development Rules

1. Never remove existing features — only add
2. Every new DB model needs `tenantId`
3. Never import Prisma in `src/middleware.ts` (Edge runtime)
4. All API responses use `{ success, data/error }` format
5. Build with `NODE_OPTIONS="--max-old-space-size=8192" npm run build`
