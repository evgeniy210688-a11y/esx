const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/account-path.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { safeAccountNext } = context.exports;
test('keeps a scanned invitation through registration', () => {
  const path = '/connect/10000000-0000-4000-8000-000000000001';
  assert.equal(safeAccountNext(path), path);
});
test('rejects external redirects and unrelated paths', () => {
  for (const path of ['//evil.test', 'https://evil.test', '/\\evil.test', '/account?reset=1', '/connect/abc', null]) assert.equal(safeAccountNext(path), '/account');
});
