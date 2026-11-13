const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file) {
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const context = { exports: {}, require: name => {
    let target = name.startsWith('@/') ? name.slice(2) : path.join(path.dirname(file), name);
    if (!path.extname(target)) target += '.ts';
    return load(target);
  }};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, context);
  return context.exports;
}
test('profile routing accepts encoded and normalized Korean URLs', () => {
  const slugs = load('lib/service-profile-slugs.json');
  const { serviceProfileId } = load('lib/service-profile-path.ts');
  for (const [id, slug] of Object.entries(slugs)) {
    for (const form of ['NFC', 'NFD']) {
      assert.equal(serviceProfileId(slug.normalize(form)), id);
      assert.equal(serviceProfileId(encodeURIComponent(slug.normalize(form))), id);
    }
  }
  assert.equal(serviceProfileId('%ZZ'), undefined);
  assert.equal(serviceProfileId('missing-profile'), undefined);
});
test('every published profile has one canonical URL in the sitemap and unique metadata', () => {
  const rows = load('lib/service-listings.snapshot.json');
  const sitemap = load('app/sitemap.ts').default();
  const { serviceProfilePath } = load('lib/service-profile-path.ts');
  const { serviceProfileMetadata } = load('lib/service-profile-metadata.ts');
  const urls = sitemap.map(entry => entry.url);
  assert.equal(urls.length, 226);
  assert.equal(new Set(urls).size, urls.length);
  for (const row of rows) {
    const canonical = 'https://www.88esx.com' + serviceProfilePath(row.id);
    assert.ok(urls.includes(canonical));
    const meta = serviceProfileMetadata(row);
    assert.equal(meta.alternates.canonical, canonical);
    assert.ok(meta.title.includes(row.name));
    assert.ok(meta.description.includes(row.name));
  }
  assert.ok(!urls.some(url => /\/admin|\/account|\/api\/|\/register/.test(url)));
  assert.equal(serviceProfilePath('7dab9a53-66c5-409c-ab50-9f6a5c8b48cf'), '/services/tkhay-alina');
});
