'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
type Credentials = {email:string;login:string;password:string};
export default function ServiceAccess({listingId,name}:{listingId:string;name:string}) {
  const [email,setEmail]=useState('');
  const [credentials,setCredentials]=useState<Credentials|null>(null);
  const [busy,setBusy]=useState(false);
  const [ready,setReady]=useState(false);
  const [hasOwner,setHasOwner]=useState(false);
  const [message,setMessage]=useState('');
  const [visible,setVisible]=useState(false);
  const [retry,setRetry]=useState(0);
  async function request(method:'GET'|'POST',signal?:AbortSignal) {
    const {data}=await supabase.auth.getSession();
    if(!data.session)throw Error('Войдите в аккаунт администратора.');
    const response=await fetch('/api/admin/service-access'+(method==='GET'?'?listing='+encodeURIComponent(listingId):''),{method,cache:'no-store',signal,headers:{Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify({listing:listingId,email})}:{})});
    const result=await response.json();
    if(!response.ok)throw Error(result.error||'Не удалось загрузить доступ.');
    return result;
  }
  useEffect(()=>{
    if(!listingId)return;
    const controller=new AbortController();setBusy(true);setReady(false);
    request('GET',controller.signal).then(result=>{if(!controller.signal.aborted){setCredentials(result.credentials);setEmail(result.credentials?.email??'');setHasOwner(!!result.hasOwner);setReady(true);setMessage('');}}).catch(error=>{if(!controller.signal.aborted)setMessage(error.message);}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});
    return()=>controller.abort();
    // The component is keyed by listing ID so secrets never carry to another card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[listingId,retry]);
  async function generate() {
    if(busy||!ready)return;
    setBusy(true);setMessage('');
    try{const result=await request('POST');setCredentials(result.credentials);setVisible(true);setMessage('Доступ создан и привязан к выбранной карточке.');}
    catch(error){setMessage(error instanceof Error?error.message:'Не удалось создать доступ.');}
    finally{setBusy(false);}
  }
  return <aside className="services-card admin-access"><h2>Доступ в личный кабинет</h2>{!listingId?<p>Выберите сохранённую компанию или специалиста.</p>:<><p><strong>{name}</strong></p><label>Почта<input type="email" value={email} disabled={busy||!!credentials||hasOwner||!ready} onChange={event=>setEmail(event.target.value)} autoComplete="off" /></label><label>Логин<input readOnly value={credentials?.login??email} autoComplete="off" /></label><small>Для входа используется почта.</small><label>Пароль<input type={visible?'text':'password'} readOnly value={credentials?.password??''} autoComplete="off" placeholder="Появится после генерации" /></label>{credentials?<><button type="button" onClick={()=>setVisible(value=>!value)}>{visible?'Скрыть пароль':'Показать пароль'}</button><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText('Вход: '+location.origin+'/account\nЛогин: '+credentials.login+'\nПароль: '+credentials.password);setMessage('Данные скопированы.');}catch{setMessage('Не удалось скопировать. Выделите данные вручную.');}}}>Скопировать данные</button></>:hasOwner?<p>У карточки уже есть личный кабинет. Пароль существующего владельца здесь не отображается.</p>:<button type="button" disabled={busy||!ready||!email.trim()} onClick={generate}>{busy?'Подождите…':'Сгенерировать и создать доступ'}</button>}<a href="/account" target="_blank" rel="noopener noreferrer">Открыть вход в личный кабинет ↗</a>{!ready&&!busy&&<button type="button" onClick={()=>setRetry(value=>value+1)}>Повторить проверку</button>}<p role="status">{message}</p></>}</aside>;
}
