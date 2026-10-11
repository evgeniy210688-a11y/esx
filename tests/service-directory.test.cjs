const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {}, URL };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/service-directory.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
const { matchesService, safeServiceWebsite } = context.exports;
const listing = { city: 'Сеул', category: 'Медицина', service_languages: ['ko', 'en'], has_interpreter: true, interpreter_languages: ['ru', 'uz'] };
const empty = { city: '', category: '', language: '', interpreter: false, interpreterLanguage: '' };
test('service language is independent of interpreter language', () => {
  assert.equal(matchesService(listing, { ...empty, language: 'ru' }), false);
  assert.equal(matchesService(listing, { ...empty, interpreterLanguage: 'ru' }), true);
  assert.equal(matchesService(listing, { ...empty, language: 'ko', interpreterLanguage: 'uz' }), true);
  assert.equal(matchesService(listing, { ...empty, language: 'ko', interpreterLanguage: 'zh' }), false);
});
test('all filters combine and interpreter language requires a human interpreter', () => {
  assert.equal(matchesService(listing, { ...empty, city: 'Сеул', category: 'Медицина', language: 'en', interpreter: true, interpreterLanguage: 'ru' }), true);
  assert.equal(matchesService(listing, { ...empty, city: 'Пусан' }), false);
  assert.equal(matchesService(listing, { ...empty, category: 'Образование' }), false);
  assert.equal(matchesService({ ...listing, has_interpreter: false }, { ...empty, interpreterLanguage: 'ru' }), false);
  assert.equal(matchesService({ ...listing, has_interpreter: false }, { ...empty, interpreter: true }), false);
  assert.equal(matchesService(listing, empty), true);
});
test('organization website links reject executable and relative URLs', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '//example.com', null, 'invalid']) assert.equal(safeServiceWebsite(url), null);
  assert.equal(safeServiceWebsite('https://example.com'), 'https://example.com/');
});
