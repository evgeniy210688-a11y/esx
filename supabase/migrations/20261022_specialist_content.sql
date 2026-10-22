begin;
-- Existing listing admin RLS and grants also protect this new column.
alter table public.esx_service_listings add column if not exists profile_content jsonb;
alter table public.esx_service_listings add constraint esx_profile_content_size check (
  profile_content is null or (
    jsonb_typeof(profile_content) = 'object' and
    profile_content->>'version' = '1' and
    jsonb_typeof(profile_content->'blocks') = 'array' and
    octet_length(profile_content::text) <= 200000
  )
);
notify pgrst, 'reload schema';
commit;
