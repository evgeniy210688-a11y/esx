const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function route(result) {
  const calls = [];
  const query = {};
  for (const method of ['select', 'eq', 'order', 'limit', 'gt', 'abortSignal']) query[method] = (...args) => { calls.push([method, ...args]); return query; };
  query.returns = async () => result;
  const context = { exports: {}, URL, Response, AbortSignal, process: { env: {} }, require: () => ({ createClient: () => ({ from: () => query }) }) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/services/directory/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return { GET: context.exports.GET, calls };
}

test('first page exposes total count without changing the array response', async () => {
  const { GET, calls } = route({ data: [{ id: 'one' }], error: null, count: 75 });
  const response = await GET({ url: 'https://example.com/api/services/directory' });
  assert.equal(response.headers.get('X-Total-Count'), '75');
  assert.deepEqual(await response.json(), [{ id: 'one' }]);
  assert.equal(calls.find(call => call[0] === 'select')[2].count, 'exact');
});
test('subsequent pages do not count the remaining subset as the full total', async () => {
  const { GET, calls } = route({ data: [], error: null, count: null });
  const response = await GET({ url: 'https://example.com/api/services/directory?after=12345678-1234-1234-1234-123456789abc' });
  assert.equal(response.headers.get('X-Total-Count'), null);
  assert.equal(calls.find(call => call[0] === 'select')[2], undefined);
});
test('an empty directory reports zero and failures remain retryable', async () => {
  const empty = route({ data: [], error: null, count: 0 });
  assert.equal((await empty.GET({ url: 'https://example.com/api/services/directory' })).headers.get('X-Total-Count'), '0');
  const failed = route({ data: null, error: new Error('offline'), count: null });
  assert.equal((await failed.GET({ url: 'https://example.com/api/services/directory' })).status, 503);
});
