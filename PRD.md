# LeadPipe AI — Lead Generation for Local Trades

## Overview
AI-powered lead generation tool for local service businesses — HVAC, plumbers, electricians, roofers, taco trucks, landscapers. Scrapes business directories, builds lead lists, and automates personalized outreach.

## Target Customer
- Digital marketing agencies serving local businesses
- Local business owners who want more customers
- Freelance marketers

## Core Features

### 1. Lead Discovery
- Enter a trade + city ("plumbers in Austin TX")
- Scrapes Google Maps, Yelp, BBB, industry directories
- Deduplicates and enriches leads (email, phone, website, reviews)
- Shows leads in a clean table

### 2. Lead Scoring
- AI scores leads based on:
  - No website or bad website (needs help)
  - Low review count (needs marketing)
  - No social media presence
  - Old/outdated listings
- Higher score = more likely to need your services

### 3. Outreach Templates
- AI-generated personalized cold emails/messages
- Templates for different trades
- Personalized based on lead data ("I noticed your Google listing only has 3 reviews...")
- Email sequence builder (follow-up #1, #2, #3)

### 4. Campaign Management
- Create campaigns per niche/city
- Track: sent, opened, replied, booked
- Dashboard with conversion metrics

### 5. Auth & Billing
- Google OAuth via Supabase
- Free tier: 25 leads/month
- Pro: $49/month — 500 leads + outreach
- Agency: $149/month — unlimited + white-label

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4o for scoring & outreach
- **Scraping**: Server-side with fetch + cheerio
- **Deployment**: Vercel
- **Language**: TypeScript

## Database Schema

### campaigns
- id, user_id, name, trade_type, location
- status (active/paused/completed)
- leads_found, emails_sent, replies_received
- created_at

### leads
- id, campaign_id, business_name, owner_name
- phone, email, website, address
- google_rating, review_count, has_website
- lead_score (0-100), status (new/contacted/replied/converted)
- created_at

### outreach
- id, lead_id, campaign_id, template_id
- subject, body, status (draft/sent/opened/replied)
- sent_at, opened_at, replied_at

### templates
- id, user_id, name, trade_type
- subject_template, body_template
- created_at

## Pages
- `/` — Landing page
- `/login` — Auth
- `/dashboard` — Campaign overview
- `/campaigns/new` — Create campaign (trade + city)
- `/campaigns/[id]` — Lead list with scores
- `/campaigns/[id]/outreach` — Email sequence builder
- `/templates` — Outreach templates
- `/settings` — Account & billing

## MVP Scope
1. Landing page with clear value prop
2. Google OAuth login
3. Campaign creation (trade + city)
4. Lead discovery (mock data initially, real scraping as stretch)
5. AI lead scoring
6. AI outreach email generation
7. Campaign dashboard
