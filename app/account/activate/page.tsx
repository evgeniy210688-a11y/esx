'use client';
import BackButton from '@/app/components/BackButton';
import { useEffect,useRef,useState,type FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import EmailSignIn from '../EmailSignIn';
import useAccount from '../useAccount';
import '../../services/services.css';
import '../../services/services-light.css';
import '../../services/services-soft.css';
import '../../services/register/registration.css';

export default function ActivateAccount() {
  const {user,ready}=useAccount();
  const [active,setActive]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
  const [login,setLogin]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[name,setName]=useState('');
  const [complete,setComplete]=useState(false);
  const lock=useRef(false);
  useEffect(()=>{const controller=new AbortController();fetch('/api/service-activation',{cache:'no-store',signal:controller.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error);if(!controller.signal.aborted){setActive(!!data.active);setName(data.name??'');}}).catch(error=>{if(!controller.signal.aborted)setMessage(error.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();},[]);
  async function redeem(event:FormEvent) {
    event.preventDefault();if(lock.current)return;lock.current=true;setBusy(true);setMessage('');
    try {
      const response=await fetch('/api/service-activation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'redeem',login,password})});
      const data=await response.json();if(!response.ok)throw Error(data.error);
      setPassword('');setName(data.name??'');setActive(true);
    }catch(error){setMessage(error instanceof Error?error.message:'Не удалось войти.');}
    finally{lock.current=false;setBusy(false);}
  }
  async function claim() {
    if(lock.current)return;lock.current=true;setBusy(true);setMessage('');
    try {
      const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Войдите в аккаунт.');
      const response=await fetch('/api/service-activation',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify({action:'claim'})});
      const data=await response.json();if(!response.ok)throw Error(data.error);
      setComplete(true);
    }catch(error){setMessage(error instanceof Error?error.message:'Не удалось завершить активацию.');}
    finally{lock.current=false;setBusy(false);}
  }
  return <div className="services-page services-directory registration-page activation-page" lang="ru"><header className="services-top"><Link href="/services">Справочник</Link><Link href="/account">Мой аккаунт</Link></header><main className="services-main"><BackButton language="ru" /><h1>Активация личного кабинета</h1>{name&&<h2>{name}</h2>}
    {loading||!ready?<p role="status">Проверяем доступ…</p>:complete?<section className="services-card"><h2>Кабинет подключён</h2><p>Теперь входите со своей почтой и паролем. Одноразовые данные больше не действуют.</p><Link href="/account">Открыть личный кабинет</Link></section>:!active?<form onSubmit={redeem} className="services-card account-form"><p>Введите одноразовые данные, которые выдал администратор.</p><label>Одноразовый логин<input required value={login} maxLength={40} autoComplete="username" autoCapitalize="none" spellCheck={false} disabled={busy} onChange={event=>setLogin(event.target.value)}/></label><label>Одноразовый пароль<input required type="password" value={password} maxLength={100} autoComplete="current-password" disabled={busy} onChange={event=>setPassword(event.target.value)}/></label><button disabled={busy}>{busy?'Проверяем…':'Войти и настроить кабинет'}</button></form>:<><p>Временные данные уже использованы. Завершите настройку в этом браузере в течение 24 часов: укажите свою почту, задайте новый пароль и подтвердите почту.</p>{!user||user.is_anonymous?<EmailSignIn language="ru" activation/>:<section className="services-card"><p>Подключить карточку к аккаунту <strong>{user.email}</strong>?</p><button disabled={busy||!user.email_confirmed_at} onClick={claim}>{busy?'Подключаем…':'Завершить настройку кабинета'}</button><button disabled={busy} onClick={async()=>{await supabase.auth.signOut();}}>Использовать другую почту</button></section>}</>}
    <p role="status" aria-live="polite">{message}</p></main></div>;
}
