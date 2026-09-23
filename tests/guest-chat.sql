-- Run after 20260922_guest_chat.sql. All fixtures are rolled back.
begin;
insert into auth.users(id, email, is_anonymous, raw_user_meta_data) values
  ('00000000-0000-4000-8000-000000000201', 'owner@example.invalid', false, '{"username":"owner_login"}'),
  ('00000000-0000-4000-8000-000000000202', null, true, '{"username":"spoofed_guest"}'),
  ('00000000-0000-4000-8000-000000000203', null, true, '{}');
select set_config('esx.test_qr', (select qr_token::text from public.esx_profiles where user_id='00000000-0000-4000-8000-000000000201'), true);
do $$ begin
  assert (select qr_token is null from public.esx_profiles where user_id='00000000-0000-4000-8000-000000000202'), 'Guest must not receive a permanent QR';
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000202',true);
select set_config('esx.test_chat', public.esx_open_conversation(current_setting('esx.test_qr')::uuid)::text, true);
do $$ begin
  assert public.esx_open_conversation(current_setting('esx.test_qr')::uuid)::text = current_setting('esx.test_chat'), 'Repeated guest scan reuses chat';
  assert (select username from public.esx_chat_participants(current_setting('esx.test_chat')::uuid) where user_id='00000000-0000-4000-8000-000000000201') = 'owner_login', 'Guest sees registered login';
  assert (select username is null from public.esx_chat_participants(current_setting('esx.test_chat')::uuid) where user_id='00000000-0000-4000-8000-000000000202'), 'Guest metadata cannot impersonate registered login';
  assert (select count(*) from public.esx_profiles) = 1, 'Other profile QR and avatar stay private';
end $$;
insert into public.esx_private_messages(chat_id,message) values (current_setting('esx.test_chat')::uuid,'Guest message');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000201',true);
do $$ begin
  assert (select count(*) from public.esx_private_messages where chat_id=current_setting('esx.test_chat')::uuid) = 1, 'Owner reads guest message';
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000203',true);
do $$ begin
  assert (select count(*) from public.esx_chat_participants(current_setting('esx.test_chat')::uuid)) = 0, 'Unrelated guest cannot read participant names';
  assert (select count(*) from public.esx_private_messages where chat_id=current_setting('esx.test_chat')::uuid) = 0, 'Unrelated guest cannot read messages';
  begin
    insert into public.esx_private_messages(chat_id,message) values (current_setting('esx.test_chat')::uuid,'Unauthorized');
    raise exception 'Unrelated guest write should fail';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
update auth.users set is_anonymous=false where id='00000000-0000-4000-8000-000000000202';
do $$ begin
  assert (select qr_token is not null from public.esx_profiles where user_id='00000000-0000-4000-8000-000000000202'), 'Upgraded account gets QR';
  assert (select qr_token::text from public.esx_profiles where user_id='00000000-0000-4000-8000-000000000201') = current_setting('esx.test_qr'), 'Owner QR remains unchanged';
end $$;
rollback;
