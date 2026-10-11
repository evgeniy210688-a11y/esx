begin;
create table public.esx_service_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.esx_service_admins enable row level security;
revoke all on public.esx_service_admins from anon, authenticated;
grant select on public.esx_service_admins to authenticated;
grant all on public.esx_service_admins to service_role;
create policy esx_service_admin_self on public.esx_service_admins for select to authenticated
  using (user_id = (select auth.uid()));
-- Role membership can only be managed by the database administrator.
-- Never trust editable user_metadata for authorization.
grant insert, update on public.esx_service_listings to authenticated;
create policy esx_services_admin_read on public.esx_service_listings for select to authenticated
  using (exists (select 1 from public.esx_service_admins where user_id = (select auth.uid())));
create policy esx_services_admin_insert on public.esx_service_listings for insert to authenticated
  with check (exists (select 1 from public.esx_service_admins where user_id = (select auth.uid())));
create policy esx_services_admin_update on public.esx_service_listings for update to authenticated
  using (exists (select 1 from public.esx_service_admins where user_id = (select auth.uid())))
  with check (exists (select 1 from public.esx_service_admins where user_id = (select auth.uid())));
commit;
