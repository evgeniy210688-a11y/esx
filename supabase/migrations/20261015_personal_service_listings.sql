begin;
alter table public.esx_service_listings
  add column listing_kind text not null default 'company'
    check (listing_kind in ('company','manager','interpreter'));

alter table public.esx_service_listings
  drop constraint esx_service_listings_city_check,
  drop constraint esx_service_listings_address_check,
  drop constraint esx_service_listings_service_languages_check,
  drop constraint esx_service_listings_check;

alter table public.esx_service_listings
  add constraint esx_service_listing_city check (
    length(trim(city)) <= 100 and (listing_kind <> 'company' or length(trim(city)) > 0)),
  add constraint esx_service_listing_address check (
    length(trim(address)) <= 500 and (listing_kind <> 'company' or length(trim(address)) > 0)),
  add constraint esx_service_listing_languages check (
    (listing_kind <> 'company' or cardinality(service_languages) > 0)
    and service_languages <@ array['ru','uz','zh','vi','en','ko']::text[]
    and array_position(service_languages, null) is null),
  add constraint esx_service_listing_interpreter check (
    (has_interpreter and (listing_kind <> 'company' or cardinality(interpreter_languages) > 0))
    or (not has_interpreter and cardinality(interpreter_languages) = 0)),
  add constraint esx_service_person_contact check (
    listing_kind = 'company' or (phone is not null
      and length(regexp_replace(phone,'[^0-9]','','g')) >= 3)),
  add constraint esx_service_person_role check (
    listing_kind = 'company'
    or (listing_kind = 'manager' and has_manager and not has_interpreter)
    or (listing_kind = 'interpreter' and has_interpreter and not has_manager));
notify pgrst, 'reload schema';
commit;
