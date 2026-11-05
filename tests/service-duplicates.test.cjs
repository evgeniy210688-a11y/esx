const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {}, URL };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/service-duplicates.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
const find = context.exports.findDuplicateListings;
const row = (id, extra = {}) => ({ id, name: 'Name ' + id, listing_kind: 'company', phone: '', ...extra });
test('normalized names produce all pairs, without repeating a pair', () => {
  const pairs = find([row('1', {name:'  РОМАШКА! '}), row('2', {name:'Ромашка'}), row('3', {name:'ромашка'})]);
  assert.equal(pairs.length, 3);
  assert.equal(pairs[0].reasons[0], 'Имя / название');
});
test('Korean local and international phone formats match', () => {
  assert.equal(find([row('1', {phone:'010-1234-5678'}), row('2', {phones:[{number:'+82 10 1234 5678'}]})]).length, 1);
});
test('blank values and shared category or address are not duplicate evidence', () => {
  assert.equal(find([row('1', {name:'',address:'Office',category:'Bank'}),row('2', {name:'',address:'Office',category:'Bank'})]).length, 0);
});
test('company and representative are not duplicates; specialist kinds can match', () => {
  assert.equal(find([row('1', {name:'Alina'}),row('2', {name:'Alina',listing_kind:'manager'})]).length,0);
  assert.equal(find([row('1', {name:'Alina',listing_kind:'interpreter'}),row('2', {name:'Alina',listing_kind:'manager'})]).length,1);
});
test('email and social profiles match, generic social homepages do not', () => {
  assert.equal(find([row('1', {email:' A@EXAMPLE.COM '}),row('2', {email:'a@example.com'})]).length,1);
  const social = url => [{url}];
  assert.equal(find([row('1',{social_links:social('https://www.instagram.com/test/')}),row('2',{social_links:social('https://instagram.com/test?igsh=123')})]).length,1);
  assert.equal(find([row('1',{social_links:social('https://instagram.com/')}),row('2',{social_links:social('https://instagram.com/')})]).length,0);
});
test('same record is never paired with itself', () => assert.equal(find([row('1'),row('1')]).length,0));
