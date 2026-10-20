begin;

create or replace function public.esx_submit_service(p_id uuid, p_input jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  kind text;
  langs text[];
  item record;
begin
  if actor is null or not exists (
    select 1 from auth.users where id = actor
      and not coalesce(is_anonymous, false) and email_confirmed_at is not null
  ) then
    raise exception 'Sign in with a verified account' using errcode = '42501';
  end if;
  if p_id is null or p_input is null or jsonb_typeof(p_input) <> 'object' then
    raise exception 'Invalid submission' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text, 0));
  -- Retrying after a lost response does not create a duplicate.
  if exists (select 1 from public.esx_service_owners
    where listing_id = p_id and user_id = actor) then return p_id; end if;
  if (select count(*) from public.esx_service_owners o
      join public.esx_service_listings l on l.id = o.listing_id
      where o.user_id = actor and (l.status = 'pending' or l.created_at > now() - interval '1 day')) >= 5 then
    raise exception 'Submission limit reached' using errcode = 'P0001';
  end if;
  select * into item from jsonb_to_record(p_input) as x(
    listing_kind text, name text, description text, city text, category text,
    address text, phone text, website text, photo text, service_languages jsonb, social_links jsonb
  );
  if p_input ? 'social_links' then
    if jsonb_typeof(item.social_links) is distinct from 'array' then
      raise exception 'Invalid social links' using errcode = '22023';
    end if;
    if jsonb_array_length(item.social_links) > 12 or exists (
      select 1 from jsonb_array_elements(item.social_links) link
      where jsonb_typeof(link) <> 'object'
        or coalesce(link->>'network','') not in ('telegram','instagram','facebook','vk','youtube','tiktok','kakao','whatsapp','wechat','naver','x','other')
        or jsonb_typeof(link->'url') is distinct from 'string'
        or length(link->>'url') > 2000
        or coalesce(link->>'url','') !~ '^https?://[^/@[:space:]]+([/?#][^[:space:]]*)?$'
    ) then raise exception 'Invalid social links' using errcode = '22023'; end if;
  end if;
  kind := item.listing_kind;
  if kind is null or kind not in ('company','manager','interpreter')
    or nullif(trim(item.name),'') is null
    or nullif(trim(item.description),'') is null
    or nullif(trim(item.category),'') is null
    or nullif(trim(item.phone),'') is null
    or not (item.phone ~ '^\+?[0-9 ()-]{3,30}$')
    or length(regexp_replace(item.phone,'[^0-9]','','g')) < 3
    or jsonb_typeof(item.service_languages) is distinct from 'array'
  then raise exception 'Invalid submission' using errcode = '22023'; end if;
  select coalesce(array_agg(value), '{}'::text[]) into langs
    from jsonb_array_elements_text(item.service_languages);
  if cardinality(langs) = 0 then
    raise exception 'Choose a service language' using errcode = '22023';
  end if;
  insert into public.esx_service_listings (
    id, listing_kind, name, description, city, category, address, phone,
    website, photo, social_links, service_languages, has_manager, has_interpreter,
    interpreter_languages, status
  ) values (
    p_id, kind, trim(item.name), trim(item.description), coalesce(trim(item.city),''),
    trim(item.category), coalesce(trim(item.address),''), trim(item.phone),
    nullif(trim(item.website),''), nullif(item.photo,''), coalesce(item.social_links,'[]'::jsonb), langs,
    kind = 'manager', kind = 'interpreter',
    case when kind = 'interpreter' then langs else '{}'::text[] end, 'pending'
  );
  insert into public.esx_service_owners(listing_id, user_id) values (p_id, actor);
  return p_id;
end;
$$;
revoke all on function public.esx_submit_service(uuid, jsonb) from public, anon;
grant execute on function public.esx_submit_service(uuid, jsonb) to authenticated;
notify pgrst, 'reload schema';
commit;
