begin;
alter table public.esx_service_listings add column if not exists email text;
alter table public.esx_service_listings add constraint esx_service_email_check check (email is null or (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'));
create or replace function public.esx_submit_service_v4(p_id uuid, p_input jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare result uuid; contact_email text := nullif(trim(p_input->>'email'),'');
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if contact_email is not null and (length(contact_email)>254 or contact_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$') then raise exception 'Invalid email' using errcode='22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text, 0));
  if exists(select 1 from public.esx_service_owners where listing_id=p_id and user_id=auth.uid()) then return p_id; end if;
  result := public.esx_submit_service_v3(p_id,p_input);
  update public.esx_service_listings set email=contact_email where id=result;
  return result;
end; $$;
revoke all on function public.esx_submit_service_v4(uuid,jsonb) from public,anon;
grant execute on function public.esx_submit_service_v4(uuid,jsonb) to authenticated;
notify pgrst, 'reload schema';
commit;
