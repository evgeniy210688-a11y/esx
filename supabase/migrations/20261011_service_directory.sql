begin;
-- Independent of chat tables, profiles, triggers and Realtime publications.
create table public.esx_service_listings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 200),
  description text not null default '' check (length(description) <= 5000),
  city text not null check (length(trim(city)) between 1 and 100),
  category text not null check (length(trim(category)) between 1 and 100),
  address text not null check (length(trim(address)) between 1 and 500),
  phone text check (phone ~ '^\+?[0-9 ()-]{3,30}$'),
  website text check (website ~ '^https?://[^[:space:]]+$'),
  service_languages text[] not null check (cardinality(service_languages) > 0 and service_languages <@ array['ru','uz','zh','vi','en','ko']::text[] and array_position(service_languages, null) is null),
  has_interpreter boolean not null default false,
  interpreter_languages text[] not null default '{}' check (interpreter_languages <@ array['ru','uz','zh','vi','en','ko']::text[] and array_position(interpreter_languages, null) is null),
  status text not null default 'draft' check (status in ('draft','pending','published','archived')),
  created_at timestamptz not null default now(),
  check ((has_interpreter and cardinality(interpreter_languages) > 0) or (not has_interpreter and cardinality(interpreter_languages) = 0))
);
-- Reserved for future company accounts; never exposed in public listing reads.
create table public.esx_service_owners (
  listing_id uuid not null references public.esx_service_listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (listing_id, user_id)
);
alter table public.esx_service_listings enable row level security;
alter table public.esx_service_owners enable row level security;
revoke all on public.esx_service_listings, public.esx_service_owners from anon, authenticated;
grant select on public.esx_service_listings to anon, authenticated;
grant all on public.esx_service_listings, public.esx_service_owners to service_role;
create policy esx_services_published on public.esx_service_listings for select to anon, authenticated using (status = 'published');
create index esx_services_public_sort on public.esx_service_listings(name, id) where status = 'published';
commit;
