-- Auto-expire temporary conversations containing exactly two guest senders.
-- Existing messages without trustworthy sender metadata are never guessed/backfilled.
begin;
create table public.esx_guest_message_auth (
  message_id bigint primary key references public.messages(id) on delete cascade,
  sender_id uuid,
  received_at timestamptz not null default clock_timestamp()
);
alter table public.esx_guest_message_auth enable row level security;
revoke all on public.esx_guest_message_auth from public, anon, authenticated;

create function public.esx_guest_message_lock() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('esx-guest-expiry:' || new.chat_id, 0));
  return new;
end;
$$;
create function public.esx_guest_message_record() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.esx_guest_message_auth(message_id,sender_id,received_at)
    values(new.id,auth.uid(),clock_timestamp());
  return new;
end;
$$;
revoke all on function public.esx_guest_message_lock() from public, anon, authenticated;
revoke all on function public.esx_guest_message_record() from public, anon, authenticated;
create trigger esx_guest_message_lock before insert on public.messages
  for each row execute function public.esx_guest_message_lock();
create trigger esx_guest_message_record after insert on public.messages
  for each row execute function public.esx_guest_message_record();

create function public.esx_expire_guest_chats() returns bigint
language plpgsql security definer set search_path = '' as $$
declare room text; removed bigint; total bigint := 0;
  cutoff timestamptz := clock_timestamp() - interval '1 hour';
begin
  for room in
    select m.chat_id from public.messages m
    left join public.esx_guest_message_auth a on a.message_id=m.id
    left join auth.users u on u.id=a.sender_id
    group by m.chat_id
    having count(*)=count(a.message_id)
      and bool_and(coalesce(u.is_anonymous,false))
      and count(distinct a.sender_id)=2
      and max(a.received_at)<=cutoff
  loop
    -- Serialize with inserts, then recheck: a new message must reset the timeout.
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('esx-guest-expiry:' || room, 0));
    if exists (
      select 1 from public.messages m
      left join public.esx_guest_message_auth a on a.message_id=m.id
      left join auth.users u on u.id=a.sender_id
      where m.chat_id=room group by m.chat_id
      having count(*)=count(a.message_id)
        and bool_and(coalesce(u.is_anonymous,false))
        and count(distinct a.sender_id)=2
        and max(a.received_at)<=cutoff
    ) then
      delete from public.messages where chat_id=room;
      get diagnostics removed = row_count;
      total := total + removed;
    end if;
  end loop;
  return total;
end;
$$;
revoke all on function public.esx_expire_guest_chats() from public, anon, authenticated;
-- Runs in the database even when every browser is closed.
create extension if not exists pg_cron;
select cron.schedule('esx-expire-two-guest-chats','* * * * *','select public.esx_expire_guest_chats();');
commit;
