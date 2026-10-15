const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file, dependencies={}) { const context={exports:{},URL,require:name=>dependencies[name]};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);return context.exports; }
const directory=load('lib/service-directory.ts');
const {parseBranchImport}=load('lib/service-branch-import.ts',{'./service-directory':directory});
test('imports 19 Excel rows including Korean addresses and optional phone',()=>{
 const text=Array.from({length:19},(_,i)=>`Радуга ${i+1}\tСеул\t서울 주소 ${i+1}\t${i? '':'+82 10-1234-5678'}`).join('\r\n');
 const result=parseBranchImport(text,[]);assert.equal(result.rows.length,19);assert.equal(result.errors.length,0);assert.equal(result.rows[0].phone,'+82 10-1234-5678');
});
test('detects duplicates within import and against existing branches after city normalization',()=>{
 const result=parseBranchImport('А | Хвасон | Адрес\nБ | Хвасонг | Адрес\nВ | Сеул | Другой', [{city:'Сеул',address:'Другой'}]);
 assert.equal(result.rows.length,1);assert.equal(result.duplicates,2);
});
test('reports malformed rows with line numbers and invalid phone',()=>{
 const result=parseBranchImport('А | Сеул\nБ | Сеул | Адрес | abc\nВ | | Адрес',[]);
 assert.equal(result.errors.length,3);assert.match(result.errors[1],/Строка 2/);assert.equal(result.rows.length,0);
});
test('accepts comma-containing addresses and blank lines without splitting them',()=>{
 const result=parseBranchImport('\nРадуга | Сеул | Seoul, street 12\n',[]);assert.equal(result.rows.length,1);assert.equal(result.rows[0].address,'Seoul, street 12');
});
