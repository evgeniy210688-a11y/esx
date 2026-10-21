begin;
grant delete on public.esx_service_listings to authenticated;
create policy esx_services_admin_delete on public.esx_service_listings
  for delete to authenticated
  using (exists (select 1 from public.esx_service_admins where user_id = (select auth.uid())));
notify pgrst, 'reload schema';
commit;
