const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function harness() {
  const events = () => ({ listeners: {}, addEventListener(k, fn) { this.listeners[k] = fn; }, removeEventListener(k) { delete this.listeners[k]; } });
  const viewport = Object.assign(events(), { height: 780, scale: 1, offsetTop: 0 });
  const list = Object.assign(events(), { scrollHeight: 1200, clientHeight: 500, scrollTop: 700, children: [{}] });
  const root = { style: { removeProperty(k) { delete this[k]; } } };
  const window = Object.assign(events(), { visualViewport: viewport });
  let resize, mutation;
  const frames = new Map(); let id = 0;
  class ResizeObserver { constructor(fn) { resize = fn; } observe() {} disconnect() {} }
  class MutationObserver { constructor(fn) { mutation = fn; } observe() {} disconnect() {} }
  const context = { exports: {}, window, ResizeObserver, MutationObserver,
    requestAnimationFrame(fn) { frames.set(++id, fn); return id; }, cancelAnimationFrame(n) { frames.delete(n); } };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/chat/observeChatViewport.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  const cleanup = context.exports.default(root, list);
  const flush = () => { for (const [id, fn] of frames) { frames.delete(id); fn(); } };
  return { viewport, list, root, window, cleanup, flush, resize: () => resize(), mutation: () => mutation(), frames };
}

test('keyboard resize keeps the newest message above the composer', () => {
  const h = harness(); h.flush();
  h.viewport.height = 380; h.list.clientHeight = 180;
  h.viewport.listeners.resize(); h.flush();
  assert.equal(h.root.style.height, '380px');
  assert.equal(h.list.scrollTop, h.list.scrollHeight);
  h.viewport.height = 780; h.viewport.listeners.resize(); h.flush();
  assert.equal(h.root.style.height, '780px');
});
test('late translation or image resizing follows the conversation bottom', () => {
  const h = harness(); h.flush();
  h.list.scrollHeight = 1500; h.resize(); h.flush();
  assert.equal(h.list.scrollTop, 1500);
});
test('reading older messages is preserved during layout changes', () => {
  const h = harness(); h.flush();
  h.list.scrollTop = 100; h.list.listeners.scroll();
  h.list.scrollHeight = 1600; h.resize(); h.mutation(); h.flush();
  assert.equal(h.list.scrollTop, 100);
});
test('zoom uses CSS sizing and cleanup removes listeners and pending work', () => {
  const h = harness();
  h.viewport.scale = 2; h.viewport.listeners.resize();
  assert.equal(h.root.style.height, undefined);
  h.cleanup();
  assert.equal(h.frames.size, 0);
  assert.equal(Object.keys(h.viewport.listeners).length, 0);
  assert.equal(Object.keys(h.window.listeners).length, 0);
  assert.equal(Object.keys(h.list.listeners).length, 0);
});

test('Safari keyboard pan keeps the dock at the visual viewport bottom', () => {
  const h = harness();
  h.viewport.height = 380;
  h.viewport.offsetTop = 240;
  h.viewport.listeners.resize();
  h.viewport.listeners.scroll();
  h.flush();
  assert.equal(h.root.style.top, '240px');
  assert.equal(parseFloat(h.root.style.top) + parseFloat(h.root.style.height), 620);
  h.viewport.offsetTop = 0;
  h.viewport.height = 780;
  h.viewport.listeners.scroll();
  assert.equal(h.root.style.top, '0px');
  h.cleanup();
  assert.equal(h.root.style.top, undefined);
});