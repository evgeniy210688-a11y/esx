begin;

create table public.esx_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  qr_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create table public.esx_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.esx_profiles(user_id) on delete cascade,
  participant_b uuid not null references public.esx_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (participant_a, participant_b),
  check (participant_a < participant_b)
);
create index on public.esx_conversations(participant_b);
create table public.esx_private_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.esx_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  message text not null check (length(trim(message)) > 0 and length(message) <= 4000),
  created_at timestamptz not null default now()
);
create index on public.esx_private_messages(chat_id, created_at, id);

alter table public.esx_profiles enable row level security;
alter table public.esx_conversations enable row level security;
alter table public.esx_private_messages enable row level security;
revoke all on public.esx_profiles, public.esx_conversations, public.esx_private_messages from anon, authenticated;
grant select on public.esx_profiles, public.esx_conversations, public.esx_private_messages to authenticated;
grant insert (chat_id, message) on public.esx_private_messages to authenticated;
create policy own_profile on public.esx_profiles for select to authenticated using (user_id = (select auth.uid()));
create policy own_conversations on public.esx_conversations for select to authenticated
  using ((select auth.uid()) in (participant_a, participant_b));
create policy read_private_messages on public.esx_private_messages for select to authenticated using (
  exists (select 1 from public.esx_conversations c where c.id = chat_id and (select auth.uid()) in (c.participant_a, c.participant_b))
);
create policy send_private_messages on public.esx_private_messages for insert to authenticated with check (
  sender_id = (select auth.uid()) and exists (
    select 1 from public.esx_conversations c where c.id = chat_id and (select auth.uid()) in (c.participant_a, c.participant_b)
  )
);

-- Profile and QR are assigned once by the database, never by editable user metadata.
create function public.esx_create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.esx_profiles(user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.esx_create_profile() from public;
create trigger esx_profile_created after insert on auth.users for each row execute function public.esx_create_profile();
insert into public.esx_profiles(user_id) select id from auth.users on conflict (user_id) do nothing;

-- Only a signed-in scanner can resolve a QR. Repeated and simultaneous scans
-- resolve to the same pair; no participant or QR can be changed by clients.
create function public.esx_open_conversation(invite_token uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); owner_id uuid; first_id uuid; second_id uuid; result uuid;
begin
  if caller is null then raise exception 'sign_in_required'; end if;
  select user_id into owner_id from public.esx_profiles where qr_token = invite_token;
  if owner_id is null then raise exception 'invite_not_found'; end if;
  if owner_id = caller then raise exception 'own_invite'; end if;
  first_id := least(caller, owner_id);
  second_id := greatest(caller, owner_id);
  insert into public.esx_conversations(participant_a, participant_b) values (first_id, second_id)
    on conflict (participant_a, participant_b) do nothing;
  select id into result from public.esx_conversations where participant_a = first_id and participant_b = second_id;
  return result;
end;
$$;
revoke all on function public.esx_open_conversation(uuid) from public, anon;
grant execute on function public.esx_open_conversation(uuid) to authenticated;
commit;
