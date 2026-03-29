# CLAUDE.md — LeadPipe AI

## Project Overview
LeadPipe AI is a lead generation SaaS for local trade businesses (HVAC, plumbers, electricians, roofers, landscapers). Users create campaigns by trade + city, discover leads with AI scoring, and send personalized outreach emails.

## Tech Stack
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Database**: Supabase (Postgres + Auth + Realtime)
- **Auth**: Supabase Google OAuth
- **AI**: OpenAI GPT-4o (lead scoring + outreach generation)
- **Payments**: Stripe (checkout + customer portal + webhooks)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Architecture
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (serverless functions)
│   ├── dashboard/         # Protected dashboard pages
│   ├── campaigns/         # Campaign management
│   └── auth/              # Auth callback
├── components/            # React components
│   └── ui/               # shadcn/ui primitives
├── lib/                   # Shared utilities
│   ├── supabase.ts       # Supabase browser client
│   ├── supabase-server.ts # Supabase server client
│   └── utils.ts          # Helpers
└── types/                 # TypeScript types
```

## Coding Standards (Uncle Bob's Clean Code)
1. **Single Responsibility** — Each function/component does ONE thing
2. **Meaningful Names** — Variables and functions describe what they do (`fetchLeadsByScore` not `getData`)
3. **Small Functions** — Max ~20 lines per function. Extract helpers.
4. **No Magic Numbers** — Use named constants (`MAX_FREE_LEADS = 25`)
5. **Error Handling** — Never swallow errors. Always handle or propagate.
6. **DRY** — Don't repeat yourself. Extract shared logic into lib/
7. **Clean Imports** — Group: external → internal → types → styles
8. **No Comments for Bad Code** — Rewrite the code instead of explaining it
9. **Dependency Injection** — Pass Supabase client, don't hardcode
10. **Tests** — If adding complex logic, add a test

## Environment Variables
All config is externalized. See `.env.example` for the full list.
Never hardcode URLs, keys, or secrets.

## Database
Supabase with RLS. Migrations in `supabase/migrations/`.
Every table has `user_id` for multi-tenant isolation via RLS policies.

## Key Decisions
- Stripe Checkout (not custom payment forms) — KISS
- Supabase Realtime for live updates
- OpenAI GPT-4o for both lead scoring and email generation
- Server-side API routes for all sensitive operations
