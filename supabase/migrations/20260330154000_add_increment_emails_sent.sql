-- Atomically increment emails_sent on a campaign
create or replace function public.increment_campaign_emails_sent(
  p_campaign_id uuid,
  p_count int
)
returns void as $$
begin
  update public.campaigns
  set emails_sent = emails_sent + p_count
  where id = p_campaign_id;
end;
$$ language plpgsql security definer;
