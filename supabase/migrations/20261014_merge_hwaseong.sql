begin;
update public.esx_service_listings
set city = 'Хвасонг, Паран'
where trim(city) ~* '^хвасонг?([[:space:]]*,[[:space:]]*паран)?$'
  and city <> 'Хвасонг, Паран';

-- Apply after 20261014_company_branches.sql.
update public.esx_service_listings as listing
set branches = (
  select jsonb_agg(
    case when trim(branch->>'city') ~* '^хвасонг?([[:space:]]*,[[:space:]]*паран)?$'
      then jsonb_set(branch, '{city}', to_jsonb('Хвасонг, Паран'::text))
      else branch end order by position
  )
  from jsonb_array_elements(listing.branches) with ordinality as entries(branch, position)
)
where exists (
  select 1 from jsonb_array_elements(listing.branches) as branch
  where trim(branch->>'city') ~* '^хвасонг?([[:space:]]*,[[:space:]]*паран)?$'
    and branch->>'city' <> 'Хвасонг, Паран'
);
commit;
