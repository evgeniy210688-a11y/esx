begin;

-- Temporary-message authors come from server-recorded authentication metadata,
-- never browser storage or a caller-supplied sender ID. Legacy rows stay read-only.
create or replace function public.esx_owned_messages(room_id uuid)
returns table(message_id text) language sql stable security definer set search_path = '' as $$
  select m.id::text from public.messages m
  join public.esx_guest_message_auth a on a.message_id = m.id
  where m.chat_id::text = room_id::text and a.sender_id = auth.uid();
$$;
revoke all on function public.esx_owned_messages(uuid) from public, anon;
grant execute on function public.esx_owned_messages(uuid) to authenticated;

create or replace function public.esx_change_message(room_id uuid, message_id text, operation text, private_chat boolean default false, replacement text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); affected bigint;
begin
  if caller is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if operation is null or operation not in ('edit', 'delete') then raise exception 'Invalid operation'; end if;
  if operation = 'edit' and (replacement is null or length(btrim(replacement)) = 0 or length(replacement) > 4000) then
    raise exception 'Invalid message';
  end if;
  if private_chat then
    if not exists (select 1 from public.esx_conversations c where c.id = room_id and caller in (c.participant_a, c.participant_b)) then
      raise exception 'Message unavailable' using errcode = '42501';
    end if;
    if operation = 'edit' then
      update public.esx_private_messages m set message = btrim(replacement)
      where m.id::text = message_id and m.chat_id = room_id and m.sender_id = caller;
    else
      delete from public.esx_private_messages m
      where m.id::text = message_id and m.chat_id = room_id and m.sender_id = caller;
    end if;
  else
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('esx-guest-expiry:' || room_id::text, 0));
    if operation = 'edit' then
      update public.messages m set message = btrim(replacement)
      where m.id::text = message_id and m.chat_id::text = room_id::text
      and exists (select 1 from public.esx_guest_message_auth a where a.message_id = m.id and a.sender_id = caller);
    else
      delete from public.messages m
      where m.id::text = message_id and m.chat_id::text = room_id::text
      and exists (select 1 from public.esx_guest_message_auth a where a.message_id = m.id and a.sender_id = caller);
    end if;
  end if;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Message unavailable' using errcode = '42501'; end if;
end;
$$;
revoke all on function public.esx_change_message(uuid,text,text,boolean,text) from public, anon;
grant execute on function public.esx_change_message(uuid,text,text,boolean,text) to authenticated;
commit;
