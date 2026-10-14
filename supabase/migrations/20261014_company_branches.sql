begin;
-- Branches share the company's publication state and existing RLS policies.
create function public.esx_valid_service_branches(value jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb; seen text[] := '{}';
begin
  if jsonb_typeof(value) is distinct from 'array' then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) is distinct from 'object'
      or jsonb_typeof(item->'id') is distinct from 'string'
      or jsonb_typeof(item->'name') is distinct from 'string'
      or jsonb_typeof(item->'city') is distinct from 'string'
      or jsonb_typeof(item->'address') is distinct from 'string'
      or jsonb_typeof(item->'phone') is distinct from 'string' then return false; end if;
    if item->>'id' !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or item->>'id' = any(seen)
      or length(trim(item->>'name')) not between 1 and 200
      or length(trim(item->>'city')) not between 1 and 100
      or length(trim(item->>'address')) not between 1 and 500 then return false; end if;
    if trim(item->>'phone') <> '' and (
      trim(item->>'phone') !~ '^\+?[0-9 ()-]{3,30}$'
      or length(regexp_replace(item->>'phone','[^0-9]','','g')) < 3
    ) then return false; end if;
    seen := array_append(seen, item->>'id');
  end loop;
  return true;
end; $$;
alter table public.esx_service_listings
  add column branches jsonb not null default '[]'::jsonb,
  add constraint esx_service_branches_valid check (public.esx_valid_service_branches(branches));
commit;
