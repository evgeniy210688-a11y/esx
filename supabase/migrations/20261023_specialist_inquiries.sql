begin;
create table public.esx_specialist_inquiries (
  id uuid primary key,
  listing_id uuid not null references public.esx_service_listings(id),
  sender_id uuid not null references auth.users(id),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  contact text not null check (char_length(btrim(contact)) between 3 and 200),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  status text not null default 'new' check (status in ('new','working','done')),
  created_at timestamptz not null default now()
);
create index esx_inquiries_inbox on public.esx_specialist_inquiries(listing_id,created_at desc);
create index esx_inquiries_sender on public.esx_specialist_inquiries(sender_id,created_at desc);
alter table public.esx_specialist_inquiries enable row level security;
revoke all on public.esx_specialist_inquiries from anon, authenticated;
grant select on public.esx_specialist_inquiries to authenticated;
grant update(status) on public.esx_specialist_inquiries to authenticated;
grant all on public.esx_specialist_inquiries to service_role;
create policy esx_inquiries_admin_read on public.esx_specialist_inquiries for select to authenticated
using (exists(select 1 from public.esx_service_admins where user_id=(select auth.uid())));
create policy esx_inquiries_admin_status on public.esx_specialist_inquiries for update to authenticated
using (exists(select 1 from public.esx_service_admins where user_id=(select auth.uid())))
with check (exists(select 1 from public.esx_service_admins where user_id=(select auth.uid())));
create function public.esx_submit_specialist_inquiry(p_id uuid,p_name text,p_contact text,p_message text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_existing uuid;
begin
  if v_user is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,true) then
    raise exception 'sign_in_required';
  end if;
  if p_id is null or p_name is null or p_contact is null or p_message is null
    or char_length(btrim(p_name)) not between 1 and 100
    or char_length(btrim(p_contact)) not between 3 and 200
    or char_length(btrim(p_message)) not between 1 and 5000 then raise exception 'invalid_input'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
  select id into v_existing from public.esx_specialist_inquiries where id=p_id and sender_id=v_user;
  if v_existing is not null then return v_existing; end if;
  if (select count(*) from public.esx_specialist_inquiries where sender_id=v_user and created_at > now()-interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;
  if not exists(select 1 from public.esx_service_listings where id='7dab9a53-66c5-409c-ab50-9f6a5c8b48cf' and status='published') then
    raise exception 'unavailable';
  end if;
  insert into public.esx_specialist_inquiries(id,listing_id,sender_id,name,contact,message)
  values(p_id,'7dab9a53-66c5-409c-ab50-9f6a5c8b48cf',v_user,btrim(p_name),btrim(p_contact),btrim(p_message));
  return p_id;
end;
$$;
revoke all on function public.esx_submit_specialist_inquiry(uuid,text,text,text) from public,anon;
grant execute on function public.esx_submit_specialist_inquiry(uuid,text,text,text) to authenticated;
notify pgrst,'reload schema';
commit;
