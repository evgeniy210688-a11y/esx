begin;
create table public.esx_service_access (
  listing_id uuid primary key references public.esx_service_listings(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  password_encrypted text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.esx_service_access enable row level security;
revoke all on public.esx_service_access from anon, authenticated;
grant all on public.esx_service_access to service_role;

create function public.esx_attach_generated_access(p_listing uuid,p_user uuid,p_email text,p_password text,p_admin uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.esx_service_listings where id=p_listing for update;
  if not found then raise exception 'Listing not found'; end if;
  if not exists(select 1 from public.esx_service_admins where user_id=p_admin) then raise exception 'Admin required'; end if;
  if exists(select 1 from public.esx_service_owners where listing_id=p_listing) then raise exception 'Owner already exists'; end if;
  insert into public.esx_service_access(listing_id,user_id,email,password_encrypted,created_by)
  values(p_listing,p_user,p_email,p_password,p_admin);
  insert into public.esx_service_owners(listing_id,user_id) values(p_listing,p_user);
end;
$$;
revoke all on function public.esx_attach_generated_access(uuid,uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.esx_attach_generated_access(uuid,uuid,text,text,uuid) to service_role;
commit;
