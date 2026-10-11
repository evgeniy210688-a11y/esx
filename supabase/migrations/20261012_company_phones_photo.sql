begin;
alter table public.esx_service_listings
  add column phones jsonb not null default '[]'::jsonb,
  add column photo text;
create function public.esx_valid_company_phones(value jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if jsonb_typeof(value) is distinct from 'array' then return false; end if;
  if jsonb_array_length(value) > 5 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) is distinct from 'object'
      or jsonb_typeof(item->'type') is distinct from 'string'
      or jsonb_typeof(item->'number') is distinct from 'string' then return false; end if;
    if item->>'type' not in ('office','mobile','other')
      or not (item->>'number' ~ '^\+?[0-9 ()-]{3,30}$')
      or length(regexp_replace(item->>'number','[^0-9]','','g')) < 3 then return false; end if;
  end loop;
  return true;
end; $$;
alter table public.esx_service_listings
  add constraint esx_company_phones_valid check (public.esx_valid_company_phones(phones)),
  add constraint esx_company_photo_valid check (photo is null or (length(photo) <= 200000 and photo ~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$'));
commit;
