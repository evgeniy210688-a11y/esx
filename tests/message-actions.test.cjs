const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function harness({own=true, sticker=false, fail=false, translated='Переведённый текст'}={}) {
  let index=0, refIndex=0;
  const state=[], refs=[], writes=[], copied=[], changes=[];
  const react={useState(initial){const i=index++;if(!(i in state))state[i]=initial;return[state[i],v=>{state[i]=v;}];},useRef(initial){const i=refIndex++;return refs[i]??=( {current:initial} );}};
  const jsx=(type,props)=>({type,props});
  const ctx={exports:{},navigator:{clipboard:{writeText:async text=>copied.push(text)}},require:p=>p==='react'?react:p==='react/jsx-runtime'?{jsx,jsxs:jsx}:p==='@/lib/message-actions'?{changeMessage:async(...args)=>{writes.push(args);if(fail)throw Error('denied');}}:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/components/MessageActions.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,ctx);
  function render(){index=0;refIndex=0;const tree=ctx.exports.default({chatId:'room',messageId:'42',message:'Original',own,sticker,language:'ru',privateChat:true,onChange:v=>changes.push(v),children:null});refs[0].current={querySelector:()=>translated?{innerText:translated}:null};return tree;}
  function nodes(tree,type){if(!tree)return[];if(Array.isArray(tree))return tree.flatMap(n=>nodes(n,type));return[...(tree.type===type?[tree]:[]),...nodes(tree.props?.children,type)];}
  function button(tree,label){return nodes(tree,'button').find(n=>n.props.children===label);}
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  return{render,nodes,button,state,writes,copied,changes,flush};
}
test('incoming text can be copied but never edited or deleted',async()=>{
  const h=harness({own:false});const tree=h.render();
  assert.equal(h.button(tree,'Изменить'),undefined);assert.equal(h.button(tree,'Убрать'),undefined);
  h.button(tree,'Копировать').props.onClick();await h.flush();
  assert.deepEqual(h.copied,['Переведённый текст']);
});
test('copy does not copy a loading label or untranslated hidden original',async()=>{
  const h=harness({own:false,translated:''});h.button(h.render(),'Копировать').props.onClick();await h.flush();
  assert.deepEqual(h.copied,[]);assert.equal(h.state[4],'error');
});
test('editing saves via ownership-checked RPC and preserves the new text',async()=>{
  const h=harness();h.button(h.render(),'Изменить').props.onClick();let tree=h.render();
  h.nodes(tree,'textarea')[0].props.onChange({target:{value:'Edited'}});tree=h.render();
  h.nodes(tree,'form')[0].props.onSubmit({preventDefault(){}});await h.flush();
  assert.deepEqual(h.writes,[['room','42','edit',true,'Edited']]);assert.deepEqual(h.changes,['Edited']);assert.equal(h.state[0],false);
});
test('failed edit retains draft and leaves displayed message unchanged',async()=>{
  const h=harness({fail:true});h.button(h.render(),'Изменить').props.onClick();let tree=h.render();
  h.nodes(tree,'textarea')[0].props.onChange({target:{value:'Keep my draft'}});tree=h.render();
  h.nodes(tree,'form')[0].props.onSubmit({preventDefault(){}});await h.flush();
  assert.deepEqual(h.changes,[]);assert.equal(h.state[2],'Keep my draft');assert.equal(h.state[0],true);assert.equal(h.state[4],'error');
});
test('delete requires confirmation and duplicate clicks only issue one mutation',async()=>{
  const h=harness();h.button(h.render(),'Убрать').props.onClick();assert.equal(h.writes.length,0);
  const button=h.button(h.render(),'Убрать');button.props.onClick();button.props.onClick();await h.flush();
  assert.equal(h.writes.length,1);assert.deepEqual(h.changes,[null]);
});
test('cancel deletion leaves the message untouched; stickers can only be deleted',()=>{
  const h=harness({sticker:true});let tree=h.render();assert.equal(h.button(tree,'Изменить'),undefined);assert.equal(h.button(tree,'Копировать'),undefined);
  h.button(tree,'Убрать').props.onClick();tree=h.render();h.button(tree,'Отмена').props.onClick();assert.equal(h.writes.length,0);assert.equal(h.state[1],false);
});
