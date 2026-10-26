begin;
create table public.esx_service_invites (
 listing_id uuid primary key references public.esx_service_listings(id) on delete cascade,
 login text not null unique,
 password_hash text,
 password_encrypted text,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '7 days',
 consumed_at timestamptz,
 session_hash text unique,
 session_expires_at timestamptz,
 claimed_by uuid references auth.users(id),
 claimed_at timestamptz
);
alter table public.esx_service_invites enable row level security;
revoke all on public.esx_service_invites from public,anon,authenticated;
grant all on public.esx_service_invites to service_role;

create function public.esx_issue_service_invite(p_listing uuid,p_login text,p_hash text,p_encrypted text,p_admin uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.esx_service_listings where id=p_listing for update;
 if not found then raise exception 'Listing missing'; end if;
 if not exists(select 1 from public.esx_service_admins where user_id=p_admin) then raise exception 'Admin required'; end if;
 if exists(select 1 from public.esx_service_owners where listing_id=p_listing) then raise exception 'Already owned'; end if;
 -- Regeneration revokes any unclaimed login and activation session.
 insert into public.esx_service_invites(listing_id,login,password_hash,password_encrypted,created_by)
 values(p_listing,p_login,p_hash,p_encrypted,p_admin)
 on conflict(listing_id) do update set login=excluded.login,password_hash=excluded.password_hash,
 password_encrypted=excluded.password_encrypted,created_by=excluded.created_by,created_at=now(),
 expires_at=now()+interval '7 days',consumed_at=null,session_hash=null,session_expires_at=null,claimed_by=null,claimed_at=null;
end; $$;

create function public.esx_redeem_service_invite(p_login text,p_hash text,p_session text)
returns uuid language plpgsql security definer set search_path='' as $$
declare listing uuid;
begin
 -- Conditional update is atomic: concurrent logins cannot consume twice.
 update public.esx_service_invites set consumed_at=now(),password_hash=null,password_encrypted=null,
 session_hash=p_session,session_expires_at=now()+interval '1 day'
 where login=p_login and password_hash=p_hash and consumed_at is null and expires_at>now() and claimed_at is null
 returning listing_id into listing;
 return listing;
end; $$;

create function public.esx_claim_service_invite(p_session text,p_user uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare listing uuid;
begin
 if not exists(select 1 from auth.users where id=p_user and not coalesce(is_anonymous,false) and email_confirmed_at is not null) then
 raise exception 'Verified email required'; end if;
 select listing_id into listing from public.esx_service_invites where session_hash=p_session and session_expires_at>now() and claimed_at is null;
 if listing is null then raise exception 'Activation expired'; end if;
 -- Same lock order as issuance and existing ownership grant.
 perform 1 from public.esx_service_listings where id=listing for update;
 perform 1 from public.esx_service_invites where listing_id=listing and session_hash=p_session and session_expires_at>now() and claimed_at is null for update;
 if not found then raise exception 'Activation expired'; end if;
 if exists(select 1 from public.esx_service_owners where listing_id=listing) then raise exception 'Already owned'; end if;
 insert into public.esx_service_owners(listing_id,user_id) values(listing,p_user);
 update public.esx_service_invites set claimed_by=p_user,claimed_at=now(),session_hash=null,session_expires_at=null where listing_id=listing;
 return listing;
end; $$;
revoke all on function public.esx_issue_service_invite(uuid,text,text,text,uuid),public.esx_redeem_service_invite(text,text,text),public.esx_claim_service_invite(text,uuid) from public,anon,authenticated;
grant execute on function public.esx_issue_service_invite(uuid,text,text,text,uuid),public.esx_redeem_service_invite(text,text,text),public.esx_claim_service_invite(text,uuid) to service_role;
notify pgrst,'reload schema';
commit;
