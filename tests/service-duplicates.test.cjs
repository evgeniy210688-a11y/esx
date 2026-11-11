const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {}, URL };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/service-duplicates.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
const find = context.exports.findDuplicateListings;
const row = (id, extra = {}) => ({ id, name: 'Name ' + id, listing_kind: 'company', phone: '', ...extra });
test('names, emails, categories and social profiles alone do not match', () => {
  const shared = { name: 'Same name', email: 'same@example.com', category: 'Bank', social_links: [{url:'https://instagram.com/same'}] };
  assert.equal(find([row('1', shared), row('2', shared)]).length, 0);
});
test('Korean local and international phone formats match', () => {
  const pairs = find([row('1', {phone:'010-1234-5678'}), row('2', {phones:[{number:'+82 10 1234 5678'}]})]);
  assert.equal(pairs.length, 1);
  assert.deepEqual(Array.from(pairs[0].reasons), ['Телефон']);
  assert.equal(find([row('1', {phone:'0082 10 1234 5678'}), row('2', {phone:'01012345678'})]).length, 1);
});
test('matching addresses ignore case and repeated whitespace', () => {
  const pairs = find([row('1', {address:'  Seoul  12-3 Office  ' }), row('2', {address:'seoul 12-3 office'})]);
  assert.equal(pairs.length, 1);
  assert.deepEqual(Array.from(pairs[0].reasons), ['Адрес']);
});
test('empty contacts and different unit numbers do not match', () => {
  assert.equal(find([row('1', {address:'  ',phone:'-'}), row('2')]).length, 0);
  assert.equal(find([row('1', {address:'Seoul 12-3'}), row('2', {address:'Seoul 123'})]).length, 0);
});
test('phone or address matches across listing kinds', () => {
  assert.equal(find([row('1', {phone:'01012345678'}), row('2', {phone:'01012345678',listing_kind:'manager'})]).length, 1);
});
test('each pair is counted once even when both phone and address match', () => {
  const shared = {phone:'01012345678',address:'Seoul 12'};
  const pairs = find([row('1',shared),row('2',shared),row('3',shared)]);
  assert.equal(pairs.length,3);
  assert.deepEqual(Array.from(pairs[0].reasons), ['Адрес','Телефон']);
});
test('same record is never paired with itself', () => assert.equal(find([row('1',{phone:'01012345678'}),row('1',{phone:'01012345678'})]).length,0));
