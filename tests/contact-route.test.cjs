const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('app/api/contact/route.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const valid = { name:'Test', email:'visitor@example.com', message:'Hello', requestId:'f33ee3d0-5fea-4e62-b763-c53ec00e8426' };
function setup({ configured = true, fail = false, providerStatus = 200, providerBody = { id:'email-id' } } = {}) {
  const calls = [];
  const context = { exports:{}, require, Buffer, URL, Response, AbortSignal, process:{ env: configured ? { RESEND_API_KEY:'test-only', CONTACT_FROM_EMAIL:'ESX <contact@example.com>' } : {} }, fetch: async (url, options) => { calls.push({ url, options }); if(fail) throw Error('network'); return Response.json(providerBody, {status:providerStatus}); } };
  vm.runInNewContext(source, context);
  return { calls, post: (body = valid, headers = {}) => context.exports.POST(new Request('https://www.88esx.com/api/contact', { method:'POST', headers:{ origin:'https://www.88esx.com', 'content-type':'application/json', ...headers }, body:JSON.stringify(body) })) };
}
test('sends to fixed recipient with visitor Reply-To and plain text', async () => {
  const h=setup(); const response=await h.post({...valid, to:'attacker@example.com'});
  assert.equal(response.status,200); assert.deepEqual(await response.json(),{ok:true});
  const body=JSON.parse(h.calls[0].options.body);
  assert.deepEqual(body.to,['88esx88@gmail.com']); assert.equal(body.reply_to,valid.email);
  assert.equal(body.from,'ESX <contact@example.com>'); assert.match(body.text,/Hello/); assert.equal(body.html,undefined);
});
test('same retry uses same provider idempotency key', async () => { const h=setup(); await h.post(); await h.post(); assert.equal(h.calls[0].options.headers['Idempotency-Key'],h.calls[1].options.headers['Idempotency-Key']); });
test('missing credentials does not report success or call provider', async () => { const h=setup({configured:false}); assert.equal((await h.post()).status,503); assert.equal(h.calls.length,0); });
test('provider rejection, malformed success and network errors never report success', async () => {
  for(const config of [{providerStatus:403},{providerBody:{}},{fail:true}]) { const h=setup(config); const response=await h.post(); assert.equal(response.status,502); assert.equal((await response.json()).ok,undefined); }
});
test('rejects cross-origin and non-JSON requests', async () => { const h=setup(); assert.equal((await h.post(valid,{origin:'https://attacker.example'})).status,403); assert.equal((await h.post(valid,{'content-type':'text/plain'})).status,415); assert.equal(h.calls.length,0); });
test('rejects bad fields, header injection and oversized messages', async () => {
  const h=setup(); for(const edit of [{name:' '},{name:'A\r\nB'},{email:'a@b.com\r\nBcc:x@y.com'},{message:' '},{message:'x'.repeat(5001)},{requestId:'bad'}]) assert.equal((await h.post({...valid,...edit})).status,400);
  assert.equal((await h.post(null)).status,400); assert.equal(h.calls.length,0);
});
test('caps actual body bytes', async () => { const h=setup(); assert.equal((await h.post({...valid,message:'x'.repeat(25000)})).status,413); assert.equal(h.calls.length,0); });
test('limits repeated attempts', async () => { const h=setup(); for(let i=0;i<3;i++) assert.equal((await h.post()).status,200); assert.equal((await h.post()).status,429); assert.equal(h.calls.length,3); });
