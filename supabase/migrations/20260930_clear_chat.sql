-- Hidden /clear command. Private rooms require membership; temporary rooms use
-- their existing unguessable room URL as the access capability.
begin;
create or replace function public.esx_clear_chat(room_id uuid, private_chat boolean default false)
returns bigint language plpgsql security definer set search_path = '' as $$
declare removed bigint;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '42501';
  end if;
  if private_chat then
    if not exists (select 1 from public.esx_conversations c where c.id=room_id
      and auth.uid() in (c.participant_a,c.participant_b)) then
      raise exception 'Not a conversation participant' using errcode = '42501';
    end if;
    delete from public.esx_private_messages where chat_id=room_id;
  else
    delete from public.messages where chat_id::text=room_id::text;
  end if;
  get diagnostics removed = row_count;
  return removed;
end;
$$;
revoke all on function public.esx_clear_chat(uuid,boolean) from public, anon;
grant execute on function public.esx_clear_chat(uuid,boolean) to authenticated;
commit;
