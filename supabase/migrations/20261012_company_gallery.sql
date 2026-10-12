begin;
alter table public.esx_service_listings add column if not exists photos jsonb not null default '[]'::jsonb;
create or replace function public.esx_valid_company_photos(value jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if jsonb_typeof(value) is distinct from 'array' then return false; end if;
  if jsonb_array_length(value) > 3 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) is distinct from 'string' then return false; end if;
    if length(item #>> '{}') > 200000 or (item #>> '{}') !~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$' then return false; end if;
  end loop;
  return true;
end; $$;
alter table public.esx_service_listings drop constraint if exists esx_company_photos_valid;
alter table public.esx_service_listings add constraint esx_company_photos_valid check(public.esx_valid_company_photos(photos));
update public.esx_service_listings set photos=jsonb_build_array(photo) where photo is not null and photos='[]'::jsonb;
commit;
