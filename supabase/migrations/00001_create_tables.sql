-- LeadPipe AI: Core database schema
-- Run against your Supabase project via the SQL editor or supabase db push

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'agency')),
  subscription_status text not null default 'active' check (subscription_status in ('active', 'canceled', 'past_due', 'trialing')),
  leads_used_this_month int not null default 0,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  trade_type text not null,
  location text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  leads_found int not null default 0,
  emails_sent int not null default 0,
  replies_received int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_user_id_idx on public.campaigns(user_id);

-- ============================================================
-- LEADS
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  business_name text not null,
  owner_name text not null default '',
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  address text not null default '',
  google_rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  has_website boolean not null default false,
  lead_score int not null default 0,
  status text not null default 'new' check (status in ('new', 'contacted', 'replied', 'converted')),
  created_at timestamptz not null default now()
);

create index if not exists leads_campaign_id_idx on public.leads(campaign_id);

-- ============================================================
-- TEMPLATES
-- ============================================================
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  trade_type text not null default 'General',
  subject_template text not null,
  body_template text not null,
  created_at timestamptz not null default now()
);

create index if not exists templates_user_id_idx on public.templates(user_id);

-- ============================================================
-- OUTREACH
-- ============================================================
create table if not exists public.outreach (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  template_id uuid references public.templates(id) on delete set null,
  subject text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'opened', 'replied')),
  sent_at timestamptz,
  opened_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists outreach_lead_id_idx on public.outreach(lead_id);
create index if not exists outreach_campaign_id_idx on public.outreach(campaign_id);

-- ============================================================
-- HELPER: auto-update updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger campaigns_updated_at before update on public.campaigns
  for each row execute function public.handle_updated_at();

-- ============================================================
-- HELPER: auto-create user profile on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- DEFAULT TEMPLATES (inserted for new users via app logic)
-- ============================================================
-- Seed templates are inserted by the app when a user first signs up.
