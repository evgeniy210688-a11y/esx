const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function readLabels(file) { const context={exports:{}}; vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context); return context.exports; }
function harness(privateChat=false,fail=false){
 let index=0;const values=[],writes=[],translations=[],clears=[];
 const state=privateChat?{2:'unsent draft',4:true}: {1:'unsent draft'};
 const jsx=(type,props)=>({type,props});
 const react={useState(initial){const n=index++;values[n]=Object.hasOwn(state,n)?state[n]:initial;return [values[n],v=>{values[n]=typeof v==='function'?v(values[n]):v;}];},useEffect(){},useRef:v=>({current:v})};
 const send=async()=>({data:[{id:99,message:writes.at(-1).message}],error:fail?{message:'offline'}:null});
 const supabase={rpc:async(name,args)=>{clears.push({name,args});return {error:fail?{message:'denied'}:null};},from:()=>({insert(payload){writes.push(payload);return privateChat?send():{select:send};}})};
 const catalog={getFoxSticker:s=>s==='[esx-fox:tired]'?'tired':null};
 const imports={'@/app/messages/[id]/privateChatLabels':readLabels('app/messages/[id]/privateChatLabels.ts'),'./privateChatLabels':readLabels('app/messages/[id]/privateChatLabels.ts'),'@/app/account/accountLabels':readLabels('app/account/accountLabels.ts'),'@/lib/guest-session':{ensureChatSession:async()=>{}},react,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'Fragment'},'@/lib/supabase':{supabase},'@/lib/fox-stickers':catalog,'@/app/components/FoxStickers':{default:'Picker',FoxStickerImage:'Sticker'},'@/app/design/content':{languages:[{code:'ru',name:'Русский'}]},'./useChatInterface':{default:()=>({language:'ru',text:{}})},'./chatLabels':{chatLabels:{ru:['Language']}},'@/app/account/useAccount':{default:()=>({user:{id:'user'},ready:true})}};
 const context={exports:{},require:p=>imports[p]??{default:p},console,alert(){},sessionStorage:{getItem:()=>null,setItem(){}}};
 const file=privateChat?'app/messages/[id]/PrivateChat.tsx':'app/chat/[id]/ChatRoomClient.tsx';
 let source=fs.readFileSync(file,'utf8');if(privateChat)source+='\nexport const TestPrivate = PrivateChatContent;';
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:false}}).outputText,context);
 const component=privateChat?context.exports.TestPrivate:context.exports.default;
 function render(overrides={}){Object.assign(state,overrides);index=0;return component({chatId:'room',user:{id:'user'},ready:true});}
 function find(node,type){if(!node)return null;if(Array.isArray(node)){for(const item of node){const found=find(item,type);if(found)return found;}return null;}if(node.type===type)return node;return find(node.props?.children,type);}
 return {render,find,writes,values,translations,clears};
}
for(const privateChat of [false,true]){
 test((privateChat?'private':'public')+' sticker sends once and preserves text draft',async()=>{
  const h=harness(privateChat);const picker=h.find(h.render(),'Picker');
  const results=await Promise.all([picker.props.onSend('[esx-fox:tired]'),picker.props.onSend('[esx-fox:tired]')]);
  assert.deepEqual(results,[true,false]);assert.equal(h.writes.length,1);assert.equal(h.writes[0].message,'[esx-fox:tired]');assert.equal(h.values[privateChat?2:1],'unsent draft');
 });
 test((privateChat?'private':'public')+' failed sticker send returns false and keeps draft',async()=>{
  const h=harness(privateChat,true);assert.equal(await h.find(h.render(),'Picker').props.onSend('[esx-fox:tired]'),false);assert.equal(h.values[privateChat?2:1],'unsent draft');
 });
 test((privateChat?'private':'public')+' incoming sticker bypasses translation',()=>{
  const h=harness(privateChat);const message={id:1,sender_id:'other',message:'[esx-fox:tired]',created_at:'2026-09-28T12:00:00Z'};
  const tree=h.render({[privateChat?0:2]:[message],[privateChat?5:3]:privateChat});
  assert.ok(h.find(tree,'Sticker'));assert.equal(h.find(tree,privateChat?'@/app/chat/[id]/MessageTranslation':'./MessageTranslation'),null);
 });
}

test('private chat switches Korean interface and translation together', () => {
 const h=harness(true);
 const tree=h.render({8:'ko'});
 assert.equal(h.find(tree,'main').props.lang,'ko');
 assert.equal(h.find(tree,'h1').props.children,'개인 대화');
 assert.equal(h.find(tree,'textarea').props.placeholder,'메시지를 입력하세요…');
 const picker=h.find(tree,'./LanguagePicker');
 picker.props.onChange('en');
 assert.equal(h.values[8],'en');
});
for (const privateChat of [false,true]) {
 test((privateChat?'private':'temporary')+' /clear is a command and is never inserted as a message', async()=>{
  const h=harness(privateChat);
  const tree=h.render({[privateChat?2:1]:'  /clear  '});
  if(privateChat) await h.find(tree,'form').props.onSubmit({preventDefault(){}}); else await h.find(tree,'Picker').props.onSend();
  assert.equal(h.writes.length,0);
  assert.equal(h.clears.length,1);
  assert.equal(h.clears[0].name,'esx_clear_chat');
  assert.equal(h.clears[0].args.private_chat,privateChat);
  assert.equal(h.clears[0].args.room_id,'room');
  assert.equal(h.values[privateChat?2:1],'');
  assert.equal(h.values[privateChat?0:2].length,0);
 });
 test((privateChat?'private':'temporary')+' failed clear preserves draft and history', async()=>{
  const h=harness(privateChat,true);
  const history=[{id:4,message:'keep',sender_id:'user',created_at:'2026-09-30T00:00:00Z'}];
  const tree=h.render({[privateChat?2:1]:'/clear',[privateChat?0:2]:history});
  if(privateChat) await h.find(tree,'form').props.onSubmit({preventDefault(){}}); else await h.find(tree,'Picker').props.onSend();
  assert.equal(h.writes.length,0);
  assert.equal(h.values[privateChat?2:1],'/clear');
  assert.equal(h.values[privateChat?0:2],history);
 });
}