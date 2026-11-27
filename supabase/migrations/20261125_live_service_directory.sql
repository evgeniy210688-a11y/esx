begin;

-- Preserve the original images of cards created during snapshot mode.
create or replace function public.esx_valid_company_photos(value jsonb) returns boolean
language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if jsonb_typeof(value) is distinct from 'array' or jsonb_array_length(value) > 21 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) is distinct from 'string' then return false; end if;
    if not ((length(item #>> '{}') <= 200000 and (item #>> '{}') ~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$')
      or (item #>> '{}') ~ '^/service-snapshot/[a-f0-9]{64}[.](jpg|png|webp)$') then return false; end if;
  end loop;
  return true;
end; $$;
alter table public.esx_service_listings drop constraint esx_company_photo_valid;
alter table public.esx_service_listings add constraint esx_company_photo_valid check (
  photo is null or (length(photo) <= 200000 and photo ~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$')
  or photo ~ '^/service-snapshot/[a-f0-9]{64}[.](jpg|png|webp)$'
);

create or replace function public.esx_public_photo_url(p_id uuid, p_index integer, p_photo text)
returns text language sql immutable set search_path = '' as $$
  select case when p_photo is null then null
    when p_photo ~ '^/service-snapshot/[a-f0-9]{64}[.](jpg|png|webp)$' then p_photo
    else '/api/services/media/' || p_id::text || '/' || p_index::text || '?v=' || md5(p_photo) end;
$$;

-- RLS is evaluated as the caller; this view exposes published public fields only.
create or replace view public.esx_public_service_listings with (security_invoker = true) as
select s.categories, s.listing_kind, s.id, s.name, s.represented_company,
  s.description, s.city, s.category, s.address, s.branches, s.phone, s.phones,
  public.esx_public_photo_url(s.id, 0, media.items->>0) as photo,
  coalesce((select jsonb_agg(public.esx_public_photo_url(s.id, (p.ordinality - 1)::integer, p.value) order by p.ordinality)
    from jsonb_array_elements_text(media.items) with ordinality p(value, ordinality)), '[]'::jsonb) as photos,
  s.business_hours, s.email, s.website, s.social_links, s.service_languages,
  s.has_manager, s.has_interpreter, s.interpreter_languages, s.profile_content
from public.esx_service_listings s
cross join lateral (select case when jsonb_array_length(s.photos) > 0 then s.photos
  when s.photo is not null then jsonb_build_array(s.photo) else '[]'::jsonb end as items) media
where s.status = 'published';
grant select on public.esx_public_service_listings to anon, authenticated;

create or replace function public.esx_public_service_photo(p_id uuid, p_index integer, p_version text)
returns text language sql stable security invoker set search_path = '' as $$
  select image from (
    select case when jsonb_array_length(photos) > 0 then photos->>p_index
      when p_index = 0 then photo else null end as image
    from public.esx_service_listings where id = p_id and status = 'published'
      and p_index between 0 and 20
  ) source where md5(image) = p_version;
$$;
revoke all on function public.esx_public_service_photo(uuid, integer, text) from public;
grant execute on function public.esx_public_service_photo(uuid, integer, text) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
