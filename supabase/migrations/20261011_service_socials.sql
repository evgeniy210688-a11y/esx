begin;
alter table public.esx_service_listings add column social_links jsonb not null default '[]'::jsonb constraint esx_service_socials_array check (jsonb_typeof(social_links) = 'array' and jsonb_array_length(social_links) <= 12);
commit;
