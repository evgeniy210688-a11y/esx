begin;
create or replace function public.esx_valid_company_photos(value jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if jsonb_typeof(value) is distinct from 'array' then return false; end if;
  if jsonb_array_length(value) > 21 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) is distinct from 'string' then return false; end if;
    if length(item #>> '{}') > 200000 or (item #>> '{}') !~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$' then return false; end if;
  end loop;
  return true;
end; $$;

create or replace function public.esx_submit_service_v3(p_id uuid, p_input jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text, 0));
  if exists(select 1 from public.esx_service_owners where listing_id=p_id and user_id=auth.uid()) then return p_id; end if;
  if not public.esx_valid_company_photos(coalesce(p_input->'photos','[]'::jsonb)) then
    raise exception 'Invalid gallery' using errcode='22023';
  end if;
  result := public.esx_submit_service_v2(p_id,p_input);
  update public.esx_service_listings set photos=coalesce(p_input->'photos','[]'::jsonb) where id=result;
  return result;
end; $$;
revoke all on function public.esx_submit_service_v3(uuid,jsonb) from public,anon;
grant execute on function public.esx_submit_service_v3(uuid,jsonb) to authenticated;
notify pgrst, 'reload schema';
commit;
