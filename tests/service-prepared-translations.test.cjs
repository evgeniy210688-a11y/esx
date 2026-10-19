const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const catalog = require('../lib/service-translations.generated.json');
function load(file, imports = {}) {
  const context = {exports: {}, require: name => imports[name]};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText, context);
  return context.exports;
}
const translations = load('lib/service-translations.ts', {'./service-translations.generated.json': catalog});
const labels = load('lib/service-category-labels.ts');
const languages = ['ru','en','ko','uz','zh','vi','tr'];
test('prepared descriptions are available synchronously in every interface language', () => {
  const sources = new Map();
  for (const key of Object.keys(catalog)) {
    const [,id,description,city,category] = JSON.parse(key);
    sources.set(id, {id,description,city,category});
    assert.ok(translations.validTranslation(catalog[key]));
  }
  assert.ok(sources.size > 0);
  for (const source of sources.values()) for (const lang of languages) {
    assert.ok(translations.preparedTranslations[translations.translationKey(lang,source)], source.id + ' missing ' + lang);
  }
});
test('edited listings never reuse stale prepared translations', () => {
  const key = Object.keys(catalog)[0];
  const [lang,id,description,city,category] = JSON.parse(key);
  const source = {id,description,city,category};
  for(const field of ['id','description','city','category']) {
    assert.equal(translations.preparedTranslations[translations.translationKey(lang,{...source,[field]:source[field]+' changed'})], undefined);
  }
});
test('all canonical categories have immediate labels for all languages', () => {
  const source = fs.readFileSync('lib/service-options.ts','utf8');
  const block = source.split('export const serviceCategories = [')[1].split('] as const')[0];
  const categories = [...block.matchAll(/"([^"]+)"/g)].map(match=>match[1]);
  assert.ok(categories.length >= 30);
  for(const category of categories) for(const lang of languages) assert.ok(labels.categoryTranslation(category,lang), category+' '+lang);
  assert.equal(labels.categoryTranslation('  МЕДИЦИНА И КЛИНИКИ  ','zh'),'医疗与诊所');
  assert.equal(labels.categoryTranslation('Unknown custom category','zh'),undefined);
});
