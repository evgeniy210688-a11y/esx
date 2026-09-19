begin;
-- A small re-encoded avatar lives in the private profile, never in auth JWTs.
alter table public.esx_profiles add column avatar text
  check (avatar is null or (length(avatar) <= 131072 and avatar ~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$'));
grant update (avatar) on public.esx_profiles to authenticated;
create policy update_own_avatar on public.esx_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- qr_token and user_id remain immutable to clients.
commit;
