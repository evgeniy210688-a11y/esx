const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('app/api/translate/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function setup({ key = 'test-only', message = 'Hello', providerStatus = 200, completed = true } = {}) {
  let calls = [];
  const databaseCalls = [];
  const query = { select: () => query, eq: () => query, maybeSingle: async () => ({ data: message === null ? null : { message }, error: null }) };
  const context = { exports: {}, require: () => ({ createClient: (_url, _key, options) => ({ from: table => { databaseCalls.push({ table, options }); return query; } }) }), process: { env: { OPENAI_API_KEY: key } }, Request, Response, URL, AbortSignal, console: { error() {} },
    fetch: async (url, options) => { calls.push({ url, options }); return Response.json({ status: completed ? 'completed' : 'incomplete', output: [{ content: [{ type: 'output_text', text: '안녕하세요' }] }] }, { status: providerStatus }); } };
  vm.runInNewContext(source, context);
  return { post: (body, headers = {}) => context.exports.POST(new Request('https://www.88esx.com/api/translate', { method: 'POST', headers: { origin: 'https://www.88esx.com', ...headers }, body: JSON.stringify(body) })), calls, databaseCalls };
}
const valid = { chatId: 'test-room', messageId: 123, target: 'ko' };
test('private translation requires a session before reading or sending any text', async () => {
  const s = setup(); assert.equal((await s.post({ ...valid, privateChat: true })).status, 401);
  assert.equal(s.calls.length, 0); assert.equal(s.databaseCalls.length, 0);
});
test('private translation forwards the caller JWT to RLS and never queries public messages', async () => {
  const s = setup(); await s.post({ ...valid, privateChat: true }, { authorization: 'Bearer test-user-session' });
  assert.equal(s.databaseCalls[0].table, 'esx_private_messages');
  assert.equal(s.databaseCalls[0].options.global.headers.Authorization, 'Bearer test-user-session');
});
test('a message hidden by RLS is never sent to the translator', async () => {
  const s = setup({ message: null });
  assert.equal((await s.post({ ...valid, privateChat: true }, { authorization: 'Bearer outsider-session' })).status, 404);
  assert.equal(s.calls.length, 0);
});
test('private cache hits still require a database authorization check', async () => {
  const s = setup(); const input = { ...valid, privateChat: true };
  await s.post(input, { authorization: 'Bearer first-session' });
  await s.post(input, { authorization: 'Bearer second-session' });
  assert.equal(s.databaseCalls.length, 2); assert.equal(s.calls.length, 1);
  assert.equal(s.databaseCalls[1].options.global.headers.Authorization, 'Bearer second-session');
});
test('rejects invalid language without calling provider', async () => { const s = setup(); assert.equal((await s.post({ ...valid, target: 'constructor' })).status, 400); assert.equal(s.calls.length, 0); });
test('missing server key returns a safe error', async () => { const s = setup({ key: '' }); assert.equal((await s.post(valid)).status, 503); assert.equal(s.calls.length, 0); });
test('missing room message is not translated', async () => { const s = setup({ message: null }); assert.equal((await s.post(valid)).status, 404); assert.equal(s.calls.length, 0); });
test('translates stored text with Luna and caches successful result', async () => {
  const s = setup(); const result = await s.post({ ...valid, text: 'Do not trust client text' });
  assert.equal((await result.json()).translation, '안녕하세요');
  const sent = JSON.parse(s.calls[0].options.body); assert.equal(sent.model, 'gpt-5.6-luna'); assert.equal(sent.input, 'Hello'); assert.equal(sent.store, false);
  await s.post(valid); assert.equal(s.calls.length, 1);
});
test('provider rate limit preserves a retryable status', async () => { const s = setup({ providerStatus: 429 }); assert.equal((await s.post(valid)).status, 429); });
test('incomplete translations are not shown as complete', async () => { const s = setup({ completed: false }); assert.equal((await s.post(valid)).status, 502); });
test('long messages never reach provider', async () => { const s = setup({ message: 'a'.repeat(4001) }); assert.equal((await s.post(valid)).status, 413); assert.equal(s.calls.length, 0); });
test('validates the sender language', async () => { const s = setup(); assert.equal((await s.post({ ...valid, source: 'invalid' })).status, 400); assert.equal(s.calls.length, 0); });
test('sender language reaches the provider and invalidates a previous cache entry', async () => {
  const s = setup(); await s.post(valid); await s.post({ ...valid, source: 'kk' });
  assert.equal(s.calls.length, 2);
  assert.match(JSON.parse(s.calls[1].options.body).instructions, /sender's selected language is Kazakh/);
});
