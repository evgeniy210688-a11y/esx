const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const rows = require('../lib/service-listings.snapshot.json');
function route(publishedServices = rows) {
  const context = { exports: {}, URL, Response, require: name => {
    assert.equal(name, '@/lib/service-snapshot');
    return { publishedServices };
  }};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/services/directory/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return context.exports.GET;
}
test('cursor traversal returns all published records from an unordered snapshot once without database access', async () => {
  const GET = route([...rows].reverse()); let cursor = ''; const ids = [];
  for (let n = 0; n < 20; n++) {
    const response = await GET(new Request('https://example.com/api/services/directory' + (cursor ? '?after='+cursor : '')));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('X-Total-Count'), String(rows.length));
    const page = await response.json(); assert.ok(page.length <= 25);
    assert.ok(page.every(row => !Object.hasOwn(row, 'profile_content')));
    ids.push(...page.map(row => row.id));
    if (page.length < 25) break;
    cursor = page.at(-1).id;
  }
  assert.deepEqual(ids, rows.map(row => row.id).sort());
  assert.equal(new Set(ids).size, rows.length);
});
test('invalid cursors fail and empty exports remain valid', async () => {
  assert.equal((await route()(new Request('https://example.com?after=bad'))).status, 400);
  const empty = await route([])(new Request('https://example.com'));
  assert.equal(empty.headers.get('X-Total-Count'), '0');
  assert.deepEqual(await empty.json(), []);
});
test('all exported media exist and match their content hashes', () => {
  const crypto = require('node:crypto');
  const paths = new Set(JSON.stringify(rows).match(/\/service-snapshot\/[a-f0-9]{64}\.(?:jpg|png|webp)/g));
  assert.ok(paths.size > 0);
  for (const path of paths) {
    const bytes = fs.readFileSync('public'+path);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), path.split('/').at(-1).split('.')[0]);
  }
});
