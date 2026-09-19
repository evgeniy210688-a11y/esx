-- Run after the migration. All synthetic data is rolled back.
begin;
insert into auth.users(id, email) values
  ('00000000-0000-4000-8000-000000000101', 'esx-test-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000102', 'esx-test-b@example.invalid'),
  ('00000000-0000-4000-8000-000000000103', 'esx-test-c@example.invalid');
select set_config('esx.test_qr', (select qr_token::text from public.esx_profiles where user_id='00000000-0000-4000-8000-000000000101'), true);
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000102',true);
select set_config('esx.test_chat', public.esx_open_conversation(current_setting('esx.test_qr')::uuid)::text, true);
do $$ begin
  assert public.esx_open_conversation(current_setting('esx.test_qr')::uuid)::text = current_setting('esx.test_chat'), 'Repeated scan must reuse conversation';
  assert (select count(*) from public.esx_profiles) = 1, 'Only own profile is readable';
  assert not has_table_privilege('authenticated', 'public.esx_profiles', 'UPDATE'), 'QR must be immutable';
  assert not has_column_privilege('authenticated', 'public.esx_profiles', 'qr_token', 'UPDATE'), 'QR column must remain immutable';
  assert has_column_privilege('authenticated', 'public.esx_profiles', 'avatar', 'UPDATE'), 'Own photo must be editable';
  assert not has_column_privilege('authenticated', 'public.esx_private_messages', 'sender_id', 'INSERT'), 'Sender spoofing must be forbidden';
end $$;
update public.esx_profiles set avatar = 'data:image/jpeg;base64,/9j/2Q==' where user_id = '00000000-0000-4000-8000-000000000102';
do $$ begin
  assert (select avatar from public.esx_profiles where user_id = '00000000-0000-4000-8000-000000000102') = 'data:image/jpeg;base64,/9j/2Q==', 'Own photo saved';
  update public.esx_profiles set avatar = 'data:image/jpeg;base64,/9j/2Q==' where user_id = '00000000-0000-4000-8000-000000000101';
  assert not found, 'Other profile must not be editable';
  begin
    update public.esx_profiles set avatar = 'data:image/svg+xml,<svg/>' where user_id = '00000000-0000-4000-8000-000000000102';
    raise exception 'SVG must be rejected';
  exception when check_violation then null;
  end;
end $$;
insert into public.esx_private_messages(chat_id,message) values (current_setting('esx.test_chat')::uuid,'Test message');
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000101',true);
do $$ begin
  assert (select count(*) from public.esx_private_messages where chat_id=current_setting('esx.test_chat')::uuid) = 1, 'Owner must read message';
  begin
    perform public.esx_open_conversation(current_setting('esx.test_qr')::uuid);
    raise exception 'Self scan should fail';
  exception when raise_exception then
    if sqlerrm <> 'own_invite' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000103',true);
do $$ begin
  assert (select count(*) from public.esx_private_messages) = 0, 'Third party must not read messages';
  assert (select count(*) from public.esx_conversations) = 0, 'Third party must not list another pair';
  begin
    insert into public.esx_private_messages(chat_id,message) values (current_setting('esx.test_chat')::uuid,'Unauthorized');
    raise exception 'Third party write should fail';
  exception when insufficient_privilege then null;
  end;
  assert public.esx_open_conversation(current_setting('esx.test_qr')::uuid)::text <> current_setting('esx.test_chat'), 'Different scanner needs separate conversation';
end $$;
reset role;
do $$ begin
  assert (select qr_token::text from public.esx_profiles where user_id='00000000-0000-4000-8000-000000000101') = current_setting('esx.test_qr'), 'Scans must preserve QR';
  assert not has_table_privilege('anon', 'public.esx_private_messages', 'SELECT'), 'Guests must not read private messages';
  assert not has_function_privilege('anon', 'public.esx_open_conversation(uuid)', 'EXECUTE'), 'Guests must not create conversations';
end $$;
rollback;
