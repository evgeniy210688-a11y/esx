begin;
create extension if not exists pg_net with schema extensions;
create table public.esx_push_config (id boolean primary key default true check(id), public_key text, private_key text, webhook_secret text not null default (gen_random_uuid()::text || gen_random_uuid()::text));
alter table public.esx_push_config enable row level security;
revoke all on public.esx_push_config from anon, authenticated;
grant all on public.esx_push_config to service_role;
insert into public.esx_push_config(id) values(true);
create table public.esx_push_subscriptions (
 endpoint text primary key check(length(endpoint)<2048 and endpoint ~ '^https://'),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 p256dh text not null check(length(p256dh) between 80 and 100), auth text not null check(length(auth) between 20 and 30),
 language text not null default 'en' check(language in ('ru','en','ko','zh','tr','vi','km','kk')), updated_at timestamptz not null default now()
);
create index on public.esx_push_subscriptions(user_id);
alter table public.esx_push_subscriptions enable row level security;
revoke all on public.esx_push_subscriptions from anon, authenticated;
grant select,insert,update,delete on public.esx_push_subscriptions to authenticated;
grant all on public.esx_push_subscriptions to service_role;
create policy own_push on public.esx_push_subscriptions for all to authenticated using (user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create function public.esx_notify_private_message() returns trigger language plpgsql security definer set search_path='' as $$
declare secret text;
begin
 if not exists(select 1 from public.esx_push_subscriptions s join public.esx_conversations c on s.user_id in(c.participant_a,c.participant_b) where c.id=new.chat_id and s.user_id<>new.sender_id) then return new; end if;
 select webhook_secret into secret from public.esx_push_config where id;
 perform net.http_post(url:='https://eypudhagwtouaxipukcq.supabase.co/functions/v1/esx-push',headers:=jsonb_build_object('Content-Type','application/json','x-esx-push-secret',secret),body:=jsonb_build_object('messageId',new.id),timeout_milliseconds:=10000);
 return new;
exception when others then
 raise warning 'Push scheduling failed'; return new;
end $$;
revoke all on function public.esx_notify_private_message() from public,anon,authenticated;
create trigger esx_private_message_push after insert on public.esx_private_messages for each row execute function public.esx_notify_private_message();
commit;
