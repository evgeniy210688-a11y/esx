begin;
alter table public.esx_service_listings drop constraint esx_service_listings_interpreter_languages_check;
alter table public.esx_service_listings add constraint esx_service_listings_interpreter_languages_check check (interpreter_languages <@ array['ru','uz','zh','vi','en','ko','th','mn','kk','tr']::text[] and array_position(interpreter_languages,null) is null);
commit;
