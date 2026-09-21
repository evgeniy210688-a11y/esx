const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies = {}) {
  const context = { exports: {}, require: name => dependencies[name] ?? require(name) };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, context);
  return context.exports;
}
const labels = load('app/account/registrationLabels.ts');
function harness(overrides = {}) {
  const state = [], calls = [];
  let cursor = 0, tree;
  const auth = Object.fromEntries(['signUp', 'signInWithPassword', 'verifyOtp', 'resend'].map(method => [method, async args => {
    calls.push({ method, args: JSON.parse(JSON.stringify(args)) });
    return overrides[method] ? overrides[method](args) : { data: { session: method === 'verifyOtp' ? { user: { id: 'confirmed-user' } } : null }, error: null };
  }]));
  const react = {
    useState(initial) { const slot = cursor++; if (!(slot in state)) state[slot] = initial; return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }]; },
    useRef(initial) { const slot = cursor++; return state[slot] ??= { current: initial }; },
    useEffect() {},
  };
  const Form = load('app/account/EmailSignIn.tsx', { react, '@/lib/supabase': { supabase: { auth } }, './registrationLabels': labels }).default;
  function nodes(node = tree) {
    if (Array.isArray(node)) return node.flatMap(nodes);
    if (!node || typeof node !== 'object') return [];
    return [node, ...nodes(node.props?.children ?? null)];
  }
  const api = {
    calls,
    render(language = 'ru') { cursor = 0; tree = Form({ language }); return api; },
    field(autoComplete, value) { nodes().find(node => node.type === 'input' && node.props.autoComplete === autoComplete).props.onChange({ target: { value } }); api.render(); },
    confirmPassword(value) { nodes().filter(node => node.type === 'input' && node.props.autoComplete === 'new-password')[1].props.onChange({ target: { value } }); api.render(); },
    async submit() { await nodes().find(node => node.type === 'form').props.onSubmit({ preventDefault() {} }); api.render(); },
    async click(text) { await nodes().find(node => node.type === 'button' && node.props.children === text).props.onClick(); api.render(); },
    status() { return nodes().find(node => node.props?.role === 'status').props.children; },
    nodes,
  };
  return api.render();
}
async function register(h) {
  h.field('username', ' Test_user ');
  h.field('email', ' TEST@EXAMPLE.COM ');
  h.field('new-password', 'test-password');
  h.confirmPassword('test-password');
  await h.submit();
}

test('signup collects four fields then verifies a six-digit code, including a leading zero', async () => {
  const h = harness();
  assert.equal(h.nodes().filter(n => n.type === 'input' && n.props.required).length, 4);
  await register(h);
  assert.deepEqual(h.calls[0], { method: 'signUp', args: { email: 'test@example.com', password: 'test-password', options: { data: { username: 'test_user', language: 'ru' } } } });
  const inputs = h.nodes().filter(n => n.type === 'input');
  assert.equal(inputs.length, 1);
  assert.equal(inputs[0].props.autoComplete, 'one-time-code');
  h.field('one-time-code', '012345');
  await h.submit();
  assert.deepEqual(h.calls[1], { method: 'verifyOtp', args: { email: 'test@example.com', token: '012345', type: 'email' } });
  assert.equal(h.status(), '');
  assert.equal(h.calls.filter(c => c.method === 'signInWithPassword').length, 0);
});

test('incomplete codes stay on confirmation without making a verification request', async () => {
  const h = harness(); await register(h);
  h.field('one-time-code', '12a3'); await h.submit();
  assert.equal(h.calls.length, 1);
  assert.equal(h.status(), labels.registrationLabels.ru.codeRequired);
});

test('expired code is recoverable and its error follows the selected language', async () => {
  const h = harness({ verifyOtp: async () => ({ data: { session: null }, error: { code: 'otp_expired' } }) });
  await register(h); h.field('one-time-code', '123456'); await h.submit();
  assert.equal(h.status(), labels.registrationLabels.ru.invalidCode);
  h.render('ko'); assert.equal(h.status(), labels.registrationLabels.ko.invalidCode);
  assert.ok(h.nodes().find(n => n.props?.autoComplete === 'one-time-code'));
});

test('resend cooldown prevents immediate duplicate emails and changing email clears the code', async () => {
  const h = harness(); await register(h);
  const resend = h.nodes().find(n => n.type === 'button' && typeof n.props.children === 'string' && n.props.children.includes('60'));
  assert.equal(resend.props.disabled, true);
  await resend.props.onClick(); assert.equal(h.calls.length, 1);
  h.field('one-time-code', '123456'); await h.click(labels.registrationLabels.ru.changeEmail);
  h.field('email', 'new@example.com'); h.field('new-password', 'test-password'); h.confirmPassword('test-password'); await h.submit();
  assert.equal(h.nodes().find(n => n.props?.autoComplete === 'one-time-code').props.value, '');
  assert.equal(h.calls[1].args.email, 'new@example.com');
});

test('unconfirmed sign-in can request a code and retry', async () => {
  const h = harness({ signInWithPassword: async () => ({ error: { code: 'email_not_confirmed' } }) });
  await h.click(labels.registrationLabels.ru.signIn);
  h.field('email', 'test@example.com'); h.field('current-password', 'test-password'); await h.submit();
  assert.equal(h.status(), labels.registrationLabels.ru.emailUnconfirmed);
  await h.click(labels.registrationLabels.ru.resend);
  assert.deepEqual(h.calls[1], { method: 'resend', args: { type: 'signup', email: 'test@example.com' } });
  assert.equal(h.status(), labels.registrationLabels.ru.emailResent);
});

test('all eight languages render the confirmation controls', async () => {
  for (const [language, t] of Object.entries(labels.registrationLabels)) {
    const h = harness(); await register(h); h.render(language);
    const buttonTexts = h.nodes().filter(n => n.type === 'button').map(n => n.props.children);
    assert.ok(buttonTexts.includes(t.verifyCode), language);
    assert.ok(t.emailCode && t.codeHelp && t.invalidCode, language);
  }
});
