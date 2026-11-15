const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/carousel-touch.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);

test('native swipe owns scrolling through long holds, momentum and multiple fingers', () => {
  const handlers = new Map();
  let time = 0, pauses = 0;
  const track = {
    addEventListener(name, handler, options) { assert.equal(options.passive, true); handlers.set(name, handler); },
    removeEventListener(name, handler) { assert.equal(handlers.get(name), handler); handlers.delete(name); },
  };
  const guard = context.exports.guardCarouselTouch(track, () => pauses++, () => time);
  assert.equal(guard.isActive(), false);
  handlers.get('touchstart')();
  time = 5000;
  assert.equal(guard.isActive(), true, 'long touch cannot resume autoplay');
  handlers.get('touchend')({ touches: [{}] });
  time += 1000;
  assert.equal(guard.isActive(), true, 'second finger still holds the track');
  handlers.get('touchend')({ touches: [] });
  for (let i = 0; i < 20; i++) {
    time += 100;
    handlers.get('scroll')();
    assert.equal(guard.isActive(), true, 'momentum extends the guard');
  }
  time += 251;
  assert.equal(guard.isActive(), false);
  const previous = pauses;
  handlers.get('scroll')();
  assert.equal(pauses, previous, 'autoplay scrolling does not pause itself');
  handlers.get('touchstart')();
  handlers.get('touchcancel')({ touches: [] });
  time += 251;
  assert.equal(guard.isActive(), false, 'cancelled touch cannot lock autoplay');
  guard.dispose();
  assert.equal(handlers.size, 0);
});
