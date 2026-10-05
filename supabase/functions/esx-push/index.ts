import { createClient } from 'npm:@supabase/supabase-js@2.112.3';
import webpush from 'npm:web-push@3.6.7';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type','Cache-Control':'no-store'};
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:cors});
const bodies:Record<string,string>={ru:'Новое сообщение в ESX',en:'New message in ESX',ko:'ESX 새 메시지',zh:'ESX 新消息',tr:'ESX yeni mesaj',vi:'Tin nhắn mới trên ESX',km:'សារថ្មីនៅ ESX',kk:'ESX жаңа хабарлама'};
function allowedEndpoint(value:string){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&(u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname.endsWith('.push.services.mozilla.com')||u.hostname==='web.push.apple.com'||u.hostname.endsWith('.push.apple.com')||u.hostname.endsWith('.notify.windows.com'));}catch{return false;}}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 try{
 let config=(await db.from('esx_push_config').select('*').eq('id',true).single()).data;
 if(!config)return reply({error:'Not configured'},503);
 if(!config.public_key){const keys=webpush.generateVAPIDKeys();await db.from('esx_push_config').update({public_key:keys.publicKey,private_key:keys.privateKey}).eq('id',true).is('public_key',null);config=(await db.from('esx_push_config').select('*').eq('id',true).single()).data;}
 if(req.method==='GET')return reply({publicKey:config.public_key});
 if(req.method!=='POST')return reply({error:'Method'},405);
 if(req.headers.get('x-esx-push-secret')!==config.webhook_secret)return reply({error:'Unauthorized'},401);
 const {messageId}=await req.json();if(typeof messageId!=='string'||! /^[0-9a-f-]{36}$/i.test(messageId))return reply({error:'Invalid message'},400);
 const {data:m,error:me}=await db.from('esx_private_messages').select('id,chat_id,sender_id,created_at').eq('id',messageId).maybeSingle();
 if(me)throw me;if(!m)return reply({sent:0});
 const {data:c,error:ce}=await db.from('esx_conversations').select('participant_a,participant_b').eq('id',m.chat_id).single();if(ce)throw ce;
 if(![c.participant_a,c.participant_b].includes(m.sender_id))return reply({error:'Invalid sender'},400);
 const recipient=c.participant_a===m.sender_id?c.participant_b:c.participant_a;
 const {data:subscriptions,error:se}=await db.from('esx_push_subscriptions').select('*').eq('user_id',recipient);if(se)throw se;
 webpush.setVapidDetails('https://www.88esx.com',config.public_key,config.private_key);
 let sent=0,failed=0;
 await Promise.all((subscriptions??[]).map(async sub=>{
 if(!allowedEndpoint(sub.endpoint)){failed++;return;}
 try {await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify({title:'ESX',body:bodies[sub.language]??bodies.en,url:'/messages/'+m.chat_id,tag:'esx-'+m.id}),{TTL:3600,urgency:'high',timeout:8000});sent++;}
 catch(err){if(err.statusCode===404||err.statusCode===410)await db.from('esx_push_subscriptions').delete().eq('endpoint',sub.endpoint).eq('user_id',recipient);else failed++;}
 }));
 return reply({sent,failed},failed?502:200);
 }catch{return reply({error:'Push failed'},500);}
});
