// Run with PGLITE_MODULE pointing to a temporary @electric-sql/pglite install.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
let PGlite;
try { ({ PGlite } = require(process.env.PGLITE_MODULE || '@electric-sql/pglite')); }
catch (error) {
  if (process.env.PGLITE_MODULE || error.code !== 'MODULE_NOT_FOUND') throw error;
}

test('submission permissions and moderation in PostgreSQL', {
  skip: PGlite ? false : 'Set PGLITE_MODULE to run database integration tests (see docs/service-registration.md)',
}, async t => {
  const db = new PGlite();
  const owner = randomUUID(), other = randomUUID(), admin = randomUUID(), guest = randomUUID(), unverified = randomUUID();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key, is_anonymous boolean, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
  `);
  for (const id of [owner, other, admin, guest]) {
    await db.query('insert into auth.users values ($1,$2,now())', [id, id === guest]);
  }
  await db.query('insert into auth.users values ($1,false,null)', [unverified]);
  for (const file of [
    '20261011_service_directory.sql', '20261011_service_socials.sql', '20261011_service_admin.sql',
    '20261012_company_phones_photo.sql', '20261012_company_manager.sql',
    '20261015_personal_service_listings.sql', '20261020_service_submissions.sql', '20261021_submission_socials.sql', '20261021_submission_phones.sql', '20261021_specialist_company.sql',
  ]) await db.exec(fs.readFileSync(path.join('supabase/migrations', file), 'utf8'));
  await db.query('insert into public.esx_service_admins(user_id) values ($1)', [admin]);
  async function as(role, id = '') {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec(`set role ${role}`);
  }
  const company = { listing_kind: 'company', name: 'Test company', description: 'Services',
    city: 'Seoul', category: 'Consulting', address: 'Seoul address', phone: '+82 10-1234-5678',
    social_links: [{ network: 'telegram', url: 'https://t.me/example' }, { network: 'instagram', url: 'https://instagram.com/example' }], service_languages: ['ru'], website: '', photo: null };
  const listing = randomUUID();
  const submit = (id, input = company) => db.query('select public.esx_submit_service($1,$2)', [id, JSON.stringify(input)]);
  try {
    await t.test('anonymous and guest accounts cannot submit', async () => {
      await as('anon');
      await assert.rejects(submit(randomUUID()), /permission denied/);
      await as('authenticated', guest);
      await assert.rejects(submit(randomUUID()), /verified account/);
      await as('authenticated', unverified);
      await assert.rejects(submit(randomUUID()), /verified account/);
    });
    await t.test('payload cannot bypass pending status or forge ownership', async () => {
      await as('authenticated', owner);
      await submit(listing, { ...company, status: 'published', user_id: other });
      assert.equal((await db.query('select status from public.esx_service_listings where id=$1', [listing])).rows[0].status, 'pending');
      assert.deepEqual((await db.query('select social_links from public.esx_service_listings where id=$1', [listing])).rows[0].social_links, company.social_links);
      assert.equal((await db.query('select user_id from public.esx_service_owners where listing_id=$1', [listing])).rows[0].user_id, owner);
    });
    await t.test('retry is idempotent', async () => {
      await submit(listing);
      assert.equal((await db.query('select count(*)::int as n from public.esx_service_owners')).rows[0].n, 1);
    });
    await t.test('owner cannot publish, edit or delete the pending listing', async () => {
      assert.equal((await db.query("update public.esx_service_listings set status='published' where id=$1 returning id", [listing])).rows.length, 0);
      assert.equal((await db.query("update public.esx_service_listings set name='Changed' where id=$1 returning id", [listing])).rows.length, 0);
      await assert.rejects(db.query('delete from public.esx_service_listings where id=$1', [listing]), /permission denied/);
      await assert.rejects(db.query('insert into public.esx_service_owners values ($1,$2)', [randomUUID(), owner]), /permission denied/);
      await assert.rejects(db.query(`insert into public.esx_service_listings
        (name,city,category,address,phone,service_languages,status)
        values ('Bypass','Seoul','Test','Seoul','12345',array['ru'],'published')`), /row-level security/);
    });
    await t.test('pending records are hidden from visitors and other users', async () => {
      await as('anon');
      assert.equal((await db.query('select id from public.esx_service_listings')).rows.length, 0);
      await as('authenticated', other);
      assert.equal((await db.query('select id from public.esx_service_listings')).rows.length, 0);
      assert.equal((await db.query('select listing_id from public.esx_service_owners')).rows.length, 0);
      await assert.rejects(submit(listing), /duplicate key/);
    });
    await t.test('invalid company and specialist submissions are rejected', async () => {
      await as('authenticated', owner);
      for (const input of [
        ...[null, {}, [{network:'telegram',url:'javascript:alert(1)'}], [{network:'unknown',url:'https://example.com'}], Array(13).fill({network:'telegram',url:'https://t.me/example'})].map(social_links => ({...company, social_links})),
        ...[null, {}, [], [{type:'mobile',number:'abc'}], [{type:'invalid',number:'12345'}], Array(6).fill({type:'mobile',number:'12345'})].map(phones => ({...company, phones})),
        { ...company, listing_kind: 'manager', represented_company: 'x'.repeat(201) },
        { ...company, address: '' }, { ...company, service_languages: [] },
        { ...company, service_languages: ['invalid'] }, { ...company, phone: 'abc' },
        { ...company, listing_kind: 'admin' }, { ...company, description: '' },
        { ...company, photo: 'invalid' }, { ...company, website: 'javascript:alert(1)' },
      ]) await assert.rejects(submit(randomUUID(), input));
    });
    await t.test('specialists and interpreters enter the moderation queue', async () => {
      for (const kind of ['manager', 'interpreter']) {
        const id = randomUUID();
        const phones = [{type:'mobile',number:'+82 10-1111-2222'}, {type:'office',number:'+82 2-333-4444'}];
        await submit(id, { ...company, phones, represented_company: kind === 'manager' ? '  Example company  ' : '', listing_kind: kind, address: '', city: '' });
        const contact = (await db.query('select phone,phones,represented_company from public.esx_service_listings where id=$1', [id])).rows[0];
        assert.deepEqual(contact.phones, phones);
        assert.equal(contact.represented_company, kind === 'manager' ? 'Example company' : null);
        assert.equal(contact.phone, phones[0].number);
        const row = (await db.query('select status,has_manager,has_interpreter from public.esx_service_listings where id=$1', [id])).rows[0];
        assert.equal(row.status, 'pending');
        assert.equal(row.has_manager, kind === 'manager');
        assert.equal(row.has_interpreter, kind === 'interpreter');
      }
    });
    await t.test('only admin approval makes the listing public', async () => {
      await as('authenticated', admin);
      assert.equal((await db.query("select id from public.esx_service_listings where status='pending'")).rows.length, 3);
      await db.query("update public.esx_service_listings set status='published' where id=$1", [listing]);
      await as('anon');
      assert.deepEqual((await db.query('select id from public.esx_service_listings')).rows, [{ id: listing }]);
      await as('authenticated', owner);
      assert.equal((await db.query("update public.esx_service_listings set name='Unreviewed' where id=$1 returning id", [listing])).rows.length, 0);
    });
    await t.test('daily submission limit and retry at the limit', async () => {
      await submit(randomUUID()); await submit(randomUUID());
      await assert.rejects(submit(randomUUID()), /limit reached/);
      await submit(listing);
    });
    await t.test('admin can decline a pending application without publishing it', async () => {
      await as('authenticated', admin);
      const id = (await db.query("select id from public.esx_service_listings where status='pending' limit 1")).rows[0].id;
      await db.query("update public.esx_service_listings set status='archived' where id=$1", [id]);
      await as('anon');
      assert.equal((await db.query('select id from public.esx_service_listings where id=$1', [id])).rows.length, 0);
      await as('authenticated', owner);
      assert.equal((await db.query('select status from public.esx_service_listings where id=$1', [id])).rows[0].status, 'archived');
    });
  } finally { await db.close(); }
});
