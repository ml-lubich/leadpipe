# LeadPipe AI

AI-powered lead generation for local trade businesses — HVAC, plumbers, electricians, roofers, landscapers, and more.

## Features

- **Lead Discovery** — Enter a trade + city to find businesses that need your services
- **AI Lead Scoring** — Scores leads 0-100 based on website quality, reviews, and online presence
- **Personalized Outreach** — AI-generated cold emails tailored to each lead's data (powered by OpenAI)
- **Campaign Management** — Track campaigns, leads, and outreach metrics
- **Template Builder** — Create and manage reusable email templates with variables
- **Subscription Billing** — Stripe-powered plans (Free / Pro / Agency) with usage limits

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: Supabase (Google OAuth)
- **Database**: Supabase (PostgreSQL + RLS)
- **AI**: OpenAI GPT-4o-mini
- **Payments**: Stripe (Checkout + Customer Portal + Webhooks)
- **Deployment**: Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration files in order via the SQL editor:
   - `supabase/migrations/00001_create_tables.sql` — tables + triggers
   - `supabase/migrations/00002_rls_policies.sql` — row level security
   - `supabase/migrations/00003_rpc_functions.sql` — helper functions
3. Enable Google OAuth in Authentication > Providers > Google
4. Add `http://localhost:3000/auth/callback` to your redirect URLs

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your credentials:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | For webhooks | Supabase service role key |
| `OPENAI_API_KEY` | Optional | Enables AI-powered lead generation and email enhancement |
| `STRIPE_SECRET_KEY` | Optional | Enables billing (use `sk_test_...` for sandbox) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Optional | Stripe Price ID for Pro plan |
| `STRIPE_AGENCY_PRICE_ID` | Optional | Stripe Price ID for Agency plan |
| `NEXT_PUBLIC_APP_URL` | Optional | App URL (defaults to `http://localhost:3000`) |

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. (Optional) Set up Stripe webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/campaigns` | List user's campaigns |
| `POST` | `/api/campaigns` | Create a campaign |
| `GET` | `/api/campaigns/[id]` | Get campaign with leads |
| `PATCH` | `/api/campaigns/[id]` | Update campaign |
| `DELETE` | `/api/campaigns/[id]` | Delete campaign |
| `POST` | `/api/leads/generate` | Generate leads for a campaign |
| `POST` | `/api/outreach/generate` | Generate outreach emails |
| `POST` | `/api/stripe/checkout` | Create Stripe checkout session |
| `POST` | `/api/stripe/portal` | Create customer portal session |
| `POST` | `/api/webhooks/stripe` | Stripe webhook handler |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Authenticated pages
│   │   ├── dashboard/      # Campaign overview
│   │   ├── campaigns/      # Campaign detail + outreach
│   │   ├── templates/      # Email templates
│   │   └── settings/       # Account & billing
│   ├── api/                # API routes
│   │   ├── campaigns/      # Campaign CRUD
│   │   ├── leads/          # Lead generation
│   │   ├── outreach/       # Email generation
│   │   ├── stripe/         # Billing endpoints
│   │   ├── webhooks/       # Stripe webhooks
│   │   └── health/         # Health check
│   ├── auth/callback/      # OAuth callback
│   ├── login/              # Login page
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── supabase/           # Supabase client setup
│   ├── stripe.ts           # Stripe client
│   ├── env.ts              # Environment validation
│   └── utils.ts
├── types/
│   └── index.ts            # TypeScript types
supabase/
└── migrations/             # Database schema + RLS policies
```

## Subscription Tiers

| Feature | Free | Pro ($49/mo) | Agency ($149/mo) |
|---------|------|-------------|-----------------|
| Leads/month | 25 | 500 | Unlimited |
| Campaigns | 1 | Unlimited | Unlimited |
| AI outreach | - | Yes | Yes |
| Priority support | - | Yes | Yes |
| API access | - | - | Yes |

## License

MIT
