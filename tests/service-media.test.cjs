const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const c={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/service-media.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,c);const m=c.exports;
test('phones preserve legacy numbers and reject malformed or excessive contacts',()=>{assert.equal(m.companyPhones({phone:'+82 2 1234'} )[0].type,'other');assert.equal(m.companyPhones({phone:null,phones:[]}).length,0);assert.ok(m.validCompanyPhones([{type:'office',number:'+82 2 1234'},{type:'mobile',number:'010-1234-5678'}]));for(const v of [[{type:'fax',number:'123'}],[{type:'office',number:'---'}],[{type:'mobile',number:'javascript:alert(1)'}],Array(6).fill({type:'office',number:'123'})])assert.equal(m.validCompanyPhones(v),false);});
test('company photo only accepts bounded JPEG data and rejects SVG and remote URLs',()=>{assert.equal(m.safeCompanyPhoto('data:image/jpeg;base64,YWJj'), 'data:image/jpeg;base64,YWJj');for(const p of ['https://example.com/a.jpg','data:image/svg+xml;base64,YWJj','data:image/jpeg;base64,'+'a'.repeat(200000),null])assert.equal(m.safeCompanyPhoto(p),null);});
test('photo upload rejects unsupported formats and oversized source files',async()=>{await assert.rejects(m.prepareCompanyPhoto({type:'image/svg+xml',size:50}));await assert.rejects(m.prepareCompanyPhoto({type:'image/jpeg',size:11*1024*1024}));});

test('gallery preserves twenty additional photos plus cover and bounds excess',()=>{
 const photo='data:image/jpeg;base64,YWJj';
 assert.equal(m.companyPhotos({photos:Array(21).fill(photo)}).length,21);
 assert.equal(m.companyPhotos({photos:Array(22).fill(photo)}).length,21);
 assert.equal(m.companyPhotos({photo}).length,1);
});
