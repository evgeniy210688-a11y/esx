/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(auth) {
  const context = { exports: {}, require: () => ({ supabase: { auth } }) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/guest-session.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, context);
  return context.exports.ensureChatSession;
}

test('existing registered and guest sessions are preserved', async () => {
  for (const is_anonymous of [true, false]) {
    const ensure = load({
      getSession: async () => ({ data: { session: { user: { is_anonymous } } } }),
      signInAnonymously: () => assert.fail('Must not replace an existing session'),
    });
    await ensure();
  }
});

test('simultaneous scan effects share a single guest sign-in', async () => {
  let calls = 0;
  const ensure = load({
    getSession: async () => ({ data: { session: null } }),
    signInAnonymously: async () => { calls++; return { data: { session: { user: { is_anonymous: true } } }, error: null }; },
  });
  await Promise.all([ensure(), ensure(), ensure()]);
  assert.equal(calls, 1);
});

test('failed anonymous sign-in can be retried', async () => {
  let calls = 0;
  const ensure = load({
    getSession: async () => ({ data: { session: null } }),
    signInAnonymously: async () => ({ data: { session: { user: { is_anonymous: true } } }, error: ++calls === 1 ? new Error('offline') : null }),
  });
  await assert.rejects(ensure(), /offline/);
  await ensure();
  assert.equal(calls, 2);
});

test('session lookup errors do not replace the current identity', async () => {
  const ensure = load({
    getSession: async () => ({ data: {}, error: new Error('storage unavailable') }),
    signInAnonymously: () => assert.fail('Cannot safely replace an unknown session'),
  });
  await assert.rejects(ensure(), /storage unavailable/);
});

test('missing guest session fails and allows another scan attempt', async () => {
  let calls = 0;
  const ensure = load({
    getSession: async () => ({ data: { session: null } }),
    signInAnonymously: async () => ({ data: { session: ++calls === 1 ? null : { user: { is_anonymous: true } } }, error: null }),
  });
  await assert.rejects(ensure(), /Guest session was not created/);
  await ensure();
  assert.equal(calls, 2);
});
