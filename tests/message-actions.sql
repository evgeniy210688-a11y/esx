-- Run in the SQL editor. Every test row is rolled back, including on failure.
begin;
do $$
declare actor uuid; outsider uuid := gen_random_uuid(); room uuid := gen_random_uuid();
  mid bigint; private_id uuid; conversation record;
begin
  select id into actor from auth.users limit 1;
  if actor is null then raise exception 'A test identity is required'; end if;
  perform set_config('request.jwt.claim.sub', actor::text, true);
  insert into public.messages(chat_id,message) values(room::text,'message action test') returning id into mid;
  if not exists(select 1 from public.esx_owned_messages(room) o where o.message_id=mid::text) then raise exception 'Ownership lookup failed'; end if;
  perform public.esx_change_message(room,mid::text,'edit',false,'edited test');
  if (select message from public.messages where id=mid) <> 'edited test' then raise exception 'Edit failed'; end if;
  begin
    perform public.esx_change_message(room,mid::text,'edit',false,'');
    raise exception 'Empty edit was allowed';
  exception when raise_exception then
    if sqlerrm <> 'Invalid message' then raise; end if;
  end;
  perform set_config('request.jwt.claim.sub', outsider::text, true);
  if exists(select 1 from public.esx_owned_messages(room)) then raise exception 'Ownership leaked'; end if;
  begin
    perform public.esx_change_message(room,mid::text,'edit',false,'unauthorized');
    raise exception 'Unauthorized edit allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform public.esx_change_message(room,mid::text,'delete');
    raise exception 'Unauthorized delete allowed';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub', actor::text, true);
  begin
    perform public.esx_change_message(gen_random_uuid(),mid::text,'delete');
    raise exception 'Wrong room allowed';
  exception when insufficient_privilege then null; end;
  perform public.esx_change_message(room,mid::text,'delete');
  if exists(select 1 from public.messages where id=mid) then raise exception 'Delete failed'; end if;
  if exists(select 1 from public.esx_guest_message_auth where message_id=mid) then raise exception 'Metadata not deleted'; end if;

  select * into conversation from public.esx_conversations limit 1;
  if conversation.id is null then raise exception 'A test conversation is required'; end if;
  actor := conversation.participant_a;
  perform set_config('request.jwt.claim.sub', actor::text, true);
  insert into public.esx_private_messages(chat_id,message,sender_id) values(conversation.id,'private action test',actor) returning id into private_id;
  perform public.esx_change_message(conversation.id,private_id::text,'edit',true,'edited private test');
  if (select message from public.esx_private_messages where id=private_id) <> 'edited private test' then raise exception 'Private edit failed'; end if;
  perform set_config('request.jwt.claim.sub', conversation.participant_b::text, true);
  begin
    perform public.esx_change_message(conversation.id,private_id::text,'edit',true,'unauthorized');
    raise exception 'Recipient edited another author';
  exception when insufficient_privilege then null; end;
  begin
    perform public.esx_change_message(conversation.id,private_id::text,'delete',true);
    raise exception 'Recipient deleted another author';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub', outsider::text, true);
  begin
    perform public.esx_change_message(conversation.id,private_id::text,'delete',true);
    raise exception 'Nonparticipant deleted message';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub', actor::text, true);
  perform public.esx_change_message(conversation.id,private_id::text,'delete',true);
  if exists(select 1 from public.esx_private_messages where id=private_id) then raise exception 'Private delete failed'; end if;
  if has_function_privilege('anon','public.esx_change_message(uuid,text,text,boolean,text)','EXECUTE') then raise exception 'Unauthenticated mutation allowed'; end if;
end;
$$;
rollback;
select 'PASS: ownership, edit, delete, validation, private membership; all test data rolled back' as result;
