-- CRM Overhaul: Transform from SaaS to Misha's personal consulting CRM

-- 1. Update leads table with new fields
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS trade text DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text DEFAULT '',
  ADD COLUMN IF NOT EXISTS website_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS digital_gaps jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update status enum to match new pipeline
-- (status column already exists as text, just update values)
UPDATE leads SET status = 'new' WHERE status NOT IN ('new', 'researched', 'contacted', 'replied', 'meeting', 'closed');

-- 2. Create outreach_history table
CREATE TABLE IF NOT EXISTS outreach_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'call', 'note')),
  content text NOT NULL DEFAULT '',
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_history_lead_id ON outreach_history(lead_id);

-- 3. Update campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS trade text DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text DEFAULT '',
  ADD COLUMN IF NOT EXISTS leads_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contacted_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS replied_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meetings_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue numeric(10,2) DEFAULT 0;

-- Migrate data from old columns if they exist
UPDATE campaigns SET trade = trade_type WHERE trade = '' AND trade_type IS NOT NULL;
UPDATE campaigns SET city = location WHERE city = '' AND location IS NOT NULL;
UPDATE campaigns SET leads_count = leads_found WHERE leads_count = 0 AND leads_found > 0;
UPDATE campaigns SET contacted_count = emails_sent WHERE contacted_count = 0 AND emails_sent > 0;
UPDATE campaigns SET replied_count = replies_received WHERE replied_count = 0 AND replies_received > 0;

-- 4. Update templates table
ALTER TABLE templates
  ADD COLUMN IF NOT EXISTS subject text DEFAULT '',
  ADD COLUMN IF NOT EXISTS body text DEFAULT '',
  ADD COLUMN IF NOT EXISTS trade text DEFAULT '';

-- Migrate old template columns
UPDATE templates SET subject = subject_template WHERE subject = '' AND subject_template IS NOT NULL;
UPDATE templates SET body = body_template WHERE body = '' AND body_template IS NOT NULL;
UPDATE templates SET trade = trade_type WHERE trade = '' AND trade_type IS NOT NULL;

-- 5. RLS policies for outreach_history
ALTER TABLE outreach_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view outreach for their leads"
  ON outreach_history FOR SELECT
  USING (lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert outreach for their leads"
  ON outreach_history FOR INSERT
  WITH CHECK (lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can update outreach for their leads"
  ON outreach_history FOR UPDATE
  USING (lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete outreach for their leads"
  ON outreach_history FOR DELETE
  USING (lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid()));

-- 6. RLS for leads with user_id (direct ownership)
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  USING (user_id = auth.uid());

-- 7. Trigger for updated_at on leads
CREATE OR REPLACE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 8. Update profiles table (simplify - remove SaaS fields)
-- Keep existing columns for backwards compat but they won't be used
