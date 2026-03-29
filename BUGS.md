# LeadPipe AI — Bug Audit

Full audit performed 2026-03-29. Every file read and reviewed.

---

## CRITICAL: No Real Data Anywhere

| # | File | Bug | Severity |
|---|------|-----|----------|
| 1 | `src/app/(dashboard)/dashboard/page.tsx` | Uses `mockCampaigns` — no Supabase queries. All stats are fake. | Critical |
| 2 | `src/app/(dashboard)/campaigns/[id]/page.tsx` | Uses `mockCampaigns` + `generateLeads()` — leads are randomly generated on every render | Critical |
| 3 | `src/app/(dashboard)/campaigns/[id]/outreach/page.tsx` | Uses `mockCampaigns`, `generateLeads()`, `mockTemplates` — entirely fake | Critical |
| 4 | `src/app/(dashboard)/campaigns/new/page.tsx` | Campaign creation does `setTimeout(1000)` then hardcoded redirect to `/campaigns/1`. No Supabase INSERT. | Critical |
| 5 | `src/app/(dashboard)/templates/page.tsx` | Templates stored in `useState` initialized from `mockTemplates`. New templates lost on refresh. No Supabase. | Critical |
| 6 | `src/app/(dashboard)/settings/page.tsx` | Hardcoded email `user@example.com`, "March 2026", "12/25 leads used". No user data fetched. | Critical |
| 7 | `src/lib/mock-data.ts` | `generateLeads()` uses `Math.random()` — lead scores/statuses change on every render/refresh | High |

## CRITICAL: No API Routes

| # | Bug | Severity |
|---|-----|----------|
| 8 | No `/api/` directory exists at all. Zero API routes. | Critical |
| 9 | No campaign CRUD endpoints | Critical |
| 10 | No lead generation/scoring endpoint (no OpenAI integration) | Critical |
| 11 | No outreach email generation endpoint | Critical |
| 12 | No health check endpoint | Critical |

## CRITICAL: No Database Schema

| # | Bug | Severity |
|---|-----|----------|
| 13 | No `supabase/migrations/` directory — no SQL schema, no tables | Critical |
| 14 | No RLS policies defined anywhere | Critical |
| 15 | Types defined in `src/types/index.ts` but no corresponding database tables | Critical |

## HIGH: Missing Integrations

| # | Bug | Severity |
|---|-----|----------|
| 16 | No OpenAI/AI integration — `openai` package not installed. Outreach "generation" is just template string replacement. | High |
| 17 | No Stripe integration — pricing page buttons just link to `/login`. No checkout, no webhooks, no subscription management. | High |
| 18 | `.env.local` has placeholder values (`https://placeholder.supabase.co`, `placeholder-key`) | High |
| 19 | `.env.local.example` only lists 2 vars — missing `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | High |

## MEDIUM: Non-Functional UI Elements

| # | File | Bug | Severity |
|---|------|-----|----------|
| 20 | `outreach/page.tsx` | "Send" and "Edit" buttons on generated emails do nothing | Medium |
| 21 | `settings/page.tsx` | "Upgrade to Pro" button does nothing | Medium |
| 22 | `settings/page.tsx` | "Delete Account" button does nothing | Medium |
| 23 | `campaigns/new/page.tsx` | No input validation beyond empty check. "Taco Trucks" in trade list (joke entry). | Low |

## MEDIUM: Missing Production Features

| # | Bug | Severity |
|---|-----|----------|
| 24 | No `error.tsx` files — no error boundaries on any route | Medium |
| 25 | No `loading.tsx` files — no loading states on any route | Medium |
| 26 | No `not-found.tsx` — no custom 404 page | Medium |
| 27 | No environment variable validation on startup | Medium |
| 28 | No rate limiting on any route | Medium |
| 29 | No input sanitization/validation on any form | Medium |

## LOW: Code Quality

| # | Bug | Severity |
|---|-----|----------|
| 30 | Dashboard layout sidebar doesn't highlight campaign detail pages in nav (only exact match for `/dashboard`) | Low |
| 31 | No `<Suspense>` boundaries for async components | Low |

---

**Summary**: The app is a UI shell with mock data. There are no API routes, no database tables, no real integrations (OpenAI, Stripe), and no production hardening. Every feature that claims to work (campaign creation, lead discovery, outreach generation, settings) is fake.
