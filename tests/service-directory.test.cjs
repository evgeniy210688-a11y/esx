const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {}, URL };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/service-directory.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
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

test('company search matches partial names, ignores case and combines with filters', () => {
  const company = { ...listing, name: 'ACCENT World Partner' };
  assert.equal(matchesService(company, { ...empty, query: '  world  ' }), true);
  assert.equal(matchesService(company, { ...empty, query: 'ＡＣＣＥＮＴ' }), true);
  assert.equal(matchesService(company, { ...empty, query: 'other' }), false);
  assert.equal(matchesService(company, { ...empty, query: 'accent', city: 'Пусан' }), false);
  assert.equal(matchesService(company, { ...empty, query: '   ' }), true);
});

test('a company is found by any branch city without duplicating it', () => {
  const company = { ...listing, name: 'Company', branches: [{city: 'Пусан'}, {city: 'Сеул'}] };
  assert.equal(matchesService(company, {...empty, city: 'Пусан'}), true);
  assert.equal(matchesService(company, {...empty, city: 'Пусан', language: 'ru'}), false);
  assert.equal(matchesService(company, {...empty, city: 'Инчхон'}), false);
  assert.deepEqual(Array.from(context.exports.serviceCities(company)), ['Сеул', 'Пусан']);
});
test('branches require location, unique IDs and a valid optional phone', () => {
  const valid = context.exports.validServiceBranches;
  const branch = {id: '12345678-1234-1234-1234-123456789abc', name: 'Филиал', city: 'Пусан', address: 'Адрес 1', phone: ''};
  assert.equal(valid([]), true);
  assert.equal(valid([branch]), true);
  assert.equal(valid([branch, branch]), false);
  for (const field of ['name', 'city', 'address']) assert.equal(valid([{...branch, [field]: '  '}]), false);
  assert.equal(valid([{...branch, phone: '+82 10-1234-5678'}]), true);
  assert.equal(valid([{...branch, phone: '---'}]), false);
  assert.equal(valid([{...branch, name: 'x'.repeat(201)}]), false);
});

test('Hwaseong companies and branches share one city filter', () => {
  for (const city of ['Хвасон', 'Хвасонг', 'Хвасон, паран', 'Хвасонг, Паран', '  ХВАСОН  ']) {
    assert.equal(context.exports.normalizeServiceCity(city), 'Хвасонг, Паран');
    assert.equal(matchesService({...listing, city}, {...empty, city: 'Хвасонг, Паран'}), true);
  }
  assert.deepEqual(Array.from(context.exports.serviceCities({city: 'Хвасон', branches: [{city: 'Хвасон, паран'}]})), ['Хвасонг, Паран']);
  assert.equal(context.exports.normalizeServiceCity('Сеул'), 'Сеул');
});

test('personal cards need a name but not a company location or category', () => {
  const minimal = { name: 'Анна', city: '', category: '', address: '' };
  for (const listing_kind of ['manager', 'interpreter']) {
    assert.equal(context.exports.validListingIdentity({...minimal, listing_kind}), true);
    assert.equal(context.exports.validListingIdentity({...minimal, listing_kind, name: '  '}), false);
  }
  assert.equal(context.exports.validListingIdentity(minimal), false);
  assert.equal(context.exports.validListingIdentity({...minimal, listing_kind: 'company'}), false);
  assert.equal(context.exports.validListingIdentity({...minimal, city: 'Сеул', category: 'Услуги', address: 'Адрес'}), true);
});
test('personal cards without a city do not create an empty city filter', () => {
  const person = {...listing, listing_kind: 'interpreter', name: 'Анна', city: '', service_languages: [], interpreter_languages: []};
  assert.deepEqual(Array.from(context.exports.serviceCities(person)), []);
  assert.equal(matchesService(person, empty), true);
  assert.equal(matchesService(person, {...empty, interpreter: true}), true);
  assert.equal(matchesService(person, {...empty, city: 'Сеул'}), false);
  assert.equal(matchesService(person, {...empty, interpreterLanguage: 'ru'}), false);
  assert.equal(context.exports.isPersonalListing({has_manager: true}), false);
});

test('search finds services, specialist names and roles across fields', () => {
  const specialist = {...listing, name: 'Инна Хен', category: 'Страховой агент', description: 'Страхование жизни, кредитные карты', listing_kind: 'manager'};
  for (const query of ['инна', 'страховой', 'кредитные карты', 'инна страховой', 'карты сеул']) {
    assert.equal(matchesService(specialist, {...empty, query}), true, query);
  }
  assert.equal(matchesService(specialist, {...empty, query: 'инна стоматология'}), false);
  assert.equal(matchesService(specialist, {...empty, query: 'страховой', city: 'Пусан'}), false);
  assert.equal(matchesService({...specialist, name: 'Алёна'}, {...empty, query: 'АЛЕНА'}), true);
  assert.equal(matchesService({...specialist, category: '', listing_kind: 'interpreter'}, {...empty, query: 'переводчик'}), true);
});

test('search includes translated services while retaining original names', () => {
  const company = {...listing, name: 'SABINA', category: 'Рестораны и кафе', description: 'Узбекская кухня'};
  const translated = {description: 'Uzbek food and catering', category: 'Restaurants and cafes', city: 'Seoul'};
  assert.equal(matchesService(company, {...empty, query: 'sabina catering'}, translated), true);
  assert.equal(matchesService(company, {...empty, query: 'узбекская'}, translated), true);
  assert.equal(matchesService(company, {...empty, query: 'restaurant'}, translated), true);
  assert.equal(matchesService(company, {...empty, query: 'dentist'}, translated), false);
});



test('multiple service cities remain separate and combine with branches', () => {
  const company = { ...listing, city: 'Сеул; Пусан; Хвасон', branches: [{city: 'Сеул'}] };
  assert.deepEqual(Array.from(context.exports.serviceCities(company)), ['Сеул', 'Пусан', 'Хвасонг, Паран']);
  for (const city of ['Сеул', 'Пусан', 'Хвасон']) assert.equal(matchesService(company, {...empty, city}), true);
  assert.equal(matchesService(company, {...empty, city: 'Инчхон'}), false);
});

test('nationwide coverage matches any city while retaining other filters', () => {
  const company = { ...listing, city: 'Вся Южная Корея' };
  for (const city of ['Сеул', 'Пусан', 'Инчхон']) assert.equal(matchesService(company, {...empty, city}), true);
  assert.equal(matchesService(company, {...empty, city: 'Пусан', category: 'Образование'}), false);
  assert.equal(matchesService(company, {...empty, city: 'Сеул', language: 'ru'}), false);
});
