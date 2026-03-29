# LeadPipe AI — Implementation Plan

## Iteration 1: Project Setup
- [x] Initialize Next.js 16 with TypeScript, Tailwind CSS, App Router
- [x] Install and configure shadcn/ui
- [x] Set up project structure (app/, components/, lib/, types/)
- [x] Commit

## Iteration 2: Landing Page
- [x] Build compelling marketing landing page
- [x] Hero section, features, pricing, CTA
- [x] Commit

## Iteration 3: Auth
- [x] Supabase client setup (browser + server + proxy)
- [x] Google OAuth login/logout
- [x] Protected route proxy (migrated from middleware)
- [x] Auth callback with template seeding for new users
- [x] Commit

## Iteration 4: Dashboard + Campaign Creation
- [x] Dashboard overview page (real Supabase data, empty states)
- [x] Campaign creation form with Supabase INSERT
- [x] Campaign list view
- [x] Commit

## Iteration 5: Lead Discovery
- [x] AI-powered lead generation via OpenAI (with mock fallback)
- [x] Lead table with sorting/filtering (server-fetched data)
- [x] AI lead scoring (0-100)
- [x] Commit

## Iteration 6: Outreach
- [x] AI-enhanced personalized cold emails (OpenAI + template fallback)
- [x] Template builder with Supabase persistence (create/delete)
- [x] Email preview and batch generation
- [x] Commit

## Iteration 7: Stripe Integration
- [x] Stripe Checkout for Pro/Agency upgrades
- [x] Stripe Customer Portal for subscription management
- [x] Webhook handler (checkout.session.completed, subscription updates/deletes)
- [x] Tier-based feature gating (leads/month limits)
- [x] Usage tracking (leads_used_this_month)
- [x] Commit

## Iteration 8: Production Hardening
- [x] Error boundaries on all pages (root + dashboard)
- [x] Loading states with skeleton UI
- [x] Custom 404 page
- [x] Environment variable validation
- [x] Health check at /api/health
- [x] Comprehensive README with setup instructions
- [x] Commit

## Iteration 9: Database & RLS
- [x] Supabase migration: users, campaigns, leads, templates, outreach tables
- [x] RLS policies: users can only access their own data
- [x] Auto-create user profile trigger on auth signup
- [x] Atomic leads_used increment RPC function
- [x] Commit

## Iteration 10: API Routes
- [x] Campaign CRUD (GET/POST/PATCH/DELETE)
- [x] Lead generation endpoint with OpenAI + mock fallback
- [x] Outreach generation endpoint with AI enhancement
- [x] Input validation and error handling on all routes
- [x] Commit

## Iteration 11: Final Validation
- [x] Migrate middleware.ts to proxy.ts (Next.js 16 convention)
- [x] Clean build (npm run build) — no errors, no warnings
- [x] All 17 routes verified in build output
- [x] Commit
