-- Increment leads_used_this_month atomically
create or replace function public.increment_leads_used(user_id_param uuid, amount int)
returns void as $$
begin
  update public.users
  set leads_used_this_month = leads_used_this_month + amount
  where id = user_id_param;
end;
$$ language plpgsql security definer;
