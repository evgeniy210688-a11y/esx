// Route-level checks use isolated clients; no live accounts or database writes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(file,overrides={}) {
 const module={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {module,exports:module.exports,require:id=>overrides[id]??require(id),Buffer,Response,Request,URL,process});
 return module.exports;
}
const helper=load('lib/service-invites.ts');
const key=Buffer.alloc(32,17),id='11111111-1111-4111-8111-111111111111';
const encrypted=helper.encryptPassword('temporary-secret',id,key);
assert.equal(helper.decryptPassword(encrypted,id,key),'temporary-secret');
assert.throws(()=>helper.decryptPassword(encrypted,'different-listing',key));
let calls=0,used=false,verified=true;
const db={from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{name:'Test listing'}})})})}),auth:{getUser:async()=>({data:{user:{id:'owner',email_confirmed_at:verified?'2026-01-01':null,is_anonymous:false}},error:null})},
 rpc:async(name,args)=>{calls++;if(name==='esx_redeem_service_invite'){if(used)return {data:null};used=true;assert.equal(args.p_hash,helper.digest(login+':password'));return {data:id};}return {data:id};}};
const route=load('app/api/service-activation/route.ts',{'@/lib/service-invites':{...helper,inviteServer:()=>({db,key})}});
const login='esx_'+'a'.repeat(24);
const request=(body,headers={})=>new Request('https://example.com/api/service-activation',{method:'POST',headers:{origin:'https://example.com','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
(async()=>{
 let r=await route.POST(request({action:'redeem',login,password:'password'},{origin:'https://other.com'}));assert.equal(r.status,403);assert.equal(calls,0);
 r=await route.POST(request({action:'redeem',login:'bad',password:'password'}));assert.equal(r.status,401);assert.equal(calls,0);
 r=await route.POST(request({action:'redeem',login,password:'password'}));assert.equal(r.status,200);assert.equal(r.headers.get('Cache-Control'),'no-store');
 const cookie=r.headers.get('Set-Cookie');for(const flag of ['HttpOnly','Secure','SameSite=Strict','Path=/api/service-activation'])assert.ok(cookie.includes(flag));
 r=await route.POST(request({action:'redeem',login,password:'password'}));assert.equal(r.status,401);
 r=await route.POST(request({action:'claim'}));assert.equal(r.status,401);
 const before=calls;verified=false;
 r=await route.POST(request({action:'claim'},{cookie,authorization:'Bearer verified-session'}));assert.equal(r.status,401);assert.equal(calls,before);
 verified=true;r=await route.POST(request({action:'claim'},{cookie,authorization:'Bearer verified-session'}));assert.equal(r.status,200);assert.ok(r.headers.get('Set-Cookie').includes('Max-Age=0'));
 const successfulRpc=db.rpc;
 db.rpc=async()=>({error:{code:'P0001',message:'Already owned'}});
 r=await route.POST(request({action:'claim'},{cookie,authorization:'Bearer verified-session'}));assert.equal(r.status,409);assert.ok((await r.json()).error.includes('уже есть владелец'));
 db.rpc=async()=>({error:{code:'42703',message:'private internal details'}});
 r=await route.POST(request({action:'claim'},{cookie,authorization:'Bearer verified-session'}));const failure=await r.json();assert.ok(failure.error.includes('42703'));assert.ok(!failure.error.includes('private internal details'));assert.equal(r.headers.get('Set-Cookie'),null);
 db.rpc=successfulRpc;
 const client={auth:{getUser:async()=>({data:{user:{id:'admin',is_anonymous:false}},error:null})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:null,error:null})})})})};
 const admin=load('app/api/admin/service-access/route.ts',{'@/lib/service-invites':helper,'@supabase/supabase-js':{createClient:()=>client}});
 r=await admin.GET(new Request('https://example.com/api/admin/service-access?listing='+id));assert.equal(r.status,401);
 r=await admin.GET(new Request('https://example.com/api/admin/service-access?listing='+id,{headers:{authorization:'Bearer non-admin'}}));assert.equal(r.status,403);
 console.log('Passed: encrypted credential binding, origin checks, malformed login, repeat-login handling, cookie security, verified-email gate, cookie removal, admin authorization.');
})().catch(error=>{console.error(error);process.exitCode=1;});
