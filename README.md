# LeadPipe AI

AI-powered lead generation for local trade businesses — HVAC, plumbers, electricians, roofers, landscapers, and more.

## Features

- **Lead Discovery** — Enter a trade + city to find businesses that need your services
- **AI Lead Scoring** — Scores leads 0-100 based on website quality, reviews, and online presence
- **Personalized Outreach** — AI-generated cold emails tailored to each lead's data
- **Campaign Management** — Track campaigns, leads, and outreach metrics
- **Template Builder** — Create and manage reusable email templates with variables

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: Supabase (Google OAuth)
- **Database**: Supabase
- **Deployment**: Vercel

## Getting Started

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Authenticated pages
│   │   ├── dashboard/      # Campaign overview
│   │   ├── campaigns/      # Campaign detail + outreach
│   │   ├── templates/      # Email templates
│   │   └── settings/       # Account & billing
│   ├── auth/callback/      # OAuth callback
│   ├── login/              # Login page
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── supabase/           # Supabase client setup
│   ├── mock-data.ts        # Mock data for demo
│   └── utils.ts
└── types/
    └── index.ts            # TypeScript types
```

## License

MIT
