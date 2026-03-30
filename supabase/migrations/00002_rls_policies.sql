-- LeadPipe AI: Row Level Security policies
-- Every table is locked down so users can only access their own data.

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;
alter table public.templates enable row level security;
alter table public.outreach enable row level security;

-- ============================================================
-- USERS
-- ============================================================
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- CAMPAIGNS
-- ============================================================
create policy "Users can read own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can insert own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- ============================================================
-- LEADS (access via campaign ownership)
-- ============================================================
create policy "Users can read leads from own campaigns"
  on public.leads for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = leads.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can insert leads into own campaigns"
  on public.leads for insert
  with check (
    exists (
      select 1 from public.campaigns
      where campaigns.id = leads.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can update leads in own campaigns"
  on public.leads for update
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = leads.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );

-- ============================================================
-- TEMPLATES
-- ============================================================
create policy "Users can read own templates"
  on public.templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.templates for delete
  using (auth.uid() = user_id);

-- ============================================================
-- OUTREACH (access via campaign ownership)
-- ============================================================
create policy "Users can read outreach from own campaigns"
  on public.outreach for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = outreach.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can insert outreach into own campaigns"
  on public.outreach for insert
  with check (
    exists (
      select 1 from public.campaigns
      where campaigns.id = outreach.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );

create policy "Users can update outreach in own campaigns"
  on public.outreach for update
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = outreach.campaign_id
        and campaigns.user_id = auth.uid()
    )
  );
