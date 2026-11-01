begin;
create or replace function public.esx_valid_company_phones(value jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if jsonb_typeof(value) is distinct from 'array' then return false; end if;
  if jsonb_array_length(value) > 5 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) is distinct from 'object'
      or jsonb_typeof(item->'type') is distinct from 'string'
      or jsonb_typeof(item->'number') is distinct from 'string' then return false; end if;
    if item->>'type' not in ('office','mobile','fax','other')
      or not (item->>'number' ~ '^\+?[0-9 ()-]{3,30}$')
      or length(regexp_replace(item->>'number','[^0-9]','','g')) < 3 then return false; end if;
  end loop;
  return true;
end; $$;
commit;
