begin;

-- Guests participate in private chats but do not receive a permanent QR.
alter table public.esx_profiles alter column qr_token drop not null;
alter table public.esx_profiles alter column qr_token drop default;
update public.esx_profiles p set qr_token = null
from auth.users u where u.id = p.user_id and u.is_anonymous is true;

create or replace function public.esx_create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.esx_profiles(user_id, qr_token)
  values (new.id, case when new.is_anonymous is true then null else gen_random_uuid() end)
  on conflict (user_id) do update
    set qr_token = case when new.is_anonymous is true then null
      else coalesce(public.esx_profiles.qr_token, excluded.qr_token) end;
  return new;
end;
$$;
create trigger esx_profile_upgraded after update of is_anonymous on auth.users
  for each row execute function public.esx_create_profile();

-- Only conversation participants can see each other's display login.
-- Do not broaden profile RLS: QR tokens and avatars remain private.
create function public.esx_chat_participants(conversation_id uuid)
returns table(user_id uuid, username text)
language sql stable security definer set search_path = '' as $$
  select u.id, case when u.is_anonymous is true then null
    else nullif(left(u.raw_user_meta_data ->> 'username', 24), '') end
  from public.esx_conversations c
  join auth.users u on u.id in (c.participant_a, c.participant_b)
  where c.id = conversation_id and auth.uid() in (c.participant_a, c.participant_b);
$$;
revoke all on function public.esx_chat_participants(uuid) from public, anon;
grant execute on function public.esx_chat_participants(uuid) to authenticated;

-- Legacy temporary rooms also display a server-assigned sender login.
alter table public.messages add column sender_login text;
create function public.esx_message_login() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    new.sender_login := old.sender_login;
    return new;
  end if;
  new.sender_login := null;
  select nullif(left(u.raw_user_meta_data ->> 'username', 24), '') into new.sender_login
  from auth.users u where u.id = auth.uid() and u.is_anonymous is not true;
  return new;
end;
$$;
revoke all on function public.esx_message_login() from public;
create trigger esx_message_login before insert or update on public.messages
  for each row execute function public.esx_message_login();

commit;
