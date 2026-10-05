'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Language } from '@/app/design/content';
export default function PushSettings({language}:{language:Language}){
 const ru=language==='ru';const [enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 useEffect(()=>{let active=true;if('serviceWorker' in navigator)void navigator.serviceWorker.getRegistration('/').then(async reg=>{const sub=await reg?.pushManager?.getSubscription(); if (sub) { const {data}=await supabase.from('esx_push_subscriptions').select('endpoint').eq('endpoint',sub.endpoint).maybeSingle(); if(active)setEnabled(Boolean(data)); }}).catch(()=>{});return()=>{active=false;};},[]);
 async function toggle(){
 if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){setStatus(ru?'На iPhone добавьте сайт на экран «Домой» и откройте его оттуда.':'On iPhone, add this site to your Home Screen and open it from there.');return;}
 setBusy(true);setStatus('');
 try{
 const permission = enabled ? Notification.permission : await Notification.requestPermission();
 if(!enabled&&permission!=='granted')throw Error(ru?'Разрешите уведомления в настройках браузера.':'Allow notifications in your browser settings.');
 const {data:{user}}=await supabase.auth.getUser();if(!user)throw Error(ru?'Сначала войдите в аккаунт.':'Sign in first.');
 const reg=await navigator.serviceWorker.register('/sw.js',{scope:'/'});await navigator.serviceWorker.ready;
 let existing=await reg.pushManager.getSubscription();
 if(enabled&&existing){const {error}=await supabase.from('esx_push_subscriptions').delete().eq('endpoint',existing.endpoint).eq('user_id',user.id);if(error)throw error;await existing.unsubscribe();setEnabled(false);return;}
 if(existing){const {data,error}=await supabase.from('esx_push_subscriptions').select('endpoint').eq('endpoint',existing.endpoint).eq('user_id',user.id).maybeSingle();if(error)throw error;if(!data){await existing.unsubscribe();existing=null;}}
 const response=await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL+'/functions/v1/esx-push');if(!response.ok)throw Error('Server unavailable');
 const {publicKey}=await response.json();const key=Uint8Array.from(atob(publicKey.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
 const sub=existing??await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});const json=sub.toJSON();
 const {error}=await supabase.from('esx_push_subscriptions').upsert({endpoint:sub.endpoint,user_id:user.id,p256dh:json.keys?.p256dh,auth:json.keys?.auth,language,updated_at:new Date().toISOString()});if(error){if(!existing)await sub.unsubscribe();throw error;}
 setEnabled(true);setStatus(ru?'Уведомления включены на этом устройстве.':'Notifications enabled on this device.');
 }catch(error){setStatus(error instanceof Error?error.message:(ru?'Не удалось включить уведомления. Попробуйте ещё раз.':'Could not enable notifications. Please retry.'));}finally{setBusy(false);}
 }
 return <section className="chat-push-settings"><button type="button" onClick={()=>void toggle()} disabled={busy}>{ru?(enabled?'Выключить уведомления':'Включить уведомления'):(enabled?'Disable notifications':'Enable notifications')}</button><p>{ru?'На iPhone: Поделиться → На экран «Домой». Откройте сайт с этой иконки и включите уведомления.':'iPhone: Share → Add to Home Screen. Open that icon, then enable notifications.'}</p>{status&&<p role="status">{status}</p>}</section>;
}
