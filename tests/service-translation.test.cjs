const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const compile = path => ts.transpileModule(fs.readFileSync(path, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const helpers = {exports:{}};
vm.runInNewContext(compile('lib/service-description.ts'), helpers);
function setup(services = ['Стрижки и укладки', 'Окрашивание волос']) {
  const calls = [];
  const data = {description:helpers.exports.joinServiceDescription('Салон красоты', 'Haircuts and styling\nHair coloring'),city:'Hwaseong, Paran',category:'Beauty and care'};
  const query = {select:()=>query,eq:()=>query,maybeSingle:async()=>({data,error:null})};
  const context = {exports:{},require:name=>name.includes('service-description')?helpers.exports:{createClient:()=>({from:()=>query})},process:{env:{OPENAI_API_KEY:'test'}},Request,Response,URL,AbortSignal,fetch:async (_url, options)=>{
    calls.push(JSON.parse(options.body));
    return Response.json({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({description:'Салон красоты',services,city:'Хвасонг, Паран',category:'Красота и уход'})}]}]});
  }};
  vm.runInNewContext(compile('app/api/services/translate/route.ts'), context);
  return {calls,post:()=>context.exports.POST(new Request('https://www.88esx.com/api/services/translate',{method:'POST',body:JSON.stringify({id:'12345678-1234-1234-1234-123456789abc',target:'ru'})}))};
}
test('mixed-language listings translate services separately and restore their storage marker', async()=>{
  const s=setup(); const response=await s.post(); assert.equal(response.status,200);
  const result=await response.json();
  assert.equal(helpers.exports.splitServiceDescription(result.description).services,'Стрижки и укладки\nОкрашивание волос');
  assert.equal(result.city,'Хвасонг, Паран');
  assert.deepEqual(JSON.parse(s.calls[0].input).services,['Haircuts and styling','Hair coloring']);
  assert.equal(s.calls[0].text.format.strict,true);
  await s.post(); assert.equal(s.calls.length,1);
});
test('missing translated service items are rejected and not cached', async()=>{
  const s=setup(['Стрижки']); assert.equal((await s.post()).status,502);
  await s.post(); assert.equal(s.calls.length,2);
});
