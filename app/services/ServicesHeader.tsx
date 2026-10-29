'use client';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import useAccount from '@/app/account/useAccount';
import { accountLabels } from '@/app/account/accountLabels';
import { supabase } from '@/lib/supabase';
import { interfaceLanguages, serviceLabels, type InterfaceLanguage } from './serviceLabels';
const flags = { ru: 'ru', uz: 'uz', zh: 'cn', vi: 'vn', en: 'gb', ko: 'kr', tr: 'tr' } as const;
const directoryLabels: Record<InterfaceLanguage, string> = { ru: 'Справочник', en: 'Directory', ko: '업체 안내', uz: 'Ma’lumotnoma', zh: '服务目录', vi: 'Danh bạ', tr: 'Rehber' };
const addCompanyLabels: Record<InterfaceLanguage,string> = {ru:'Добавить компанию',en:'Add a company',ko:'업체 등록',uz:'Kompaniya qo‘shish',zh:'添加公司',vi:'Thêm công ty',tr:'Şirket ekle'};
const signInLabels: Record<InterfaceLanguage,string> = {ru:'Войти',en:'Sign in',ko:'로그인',uz:'Kirish',zh:'登录',vi:'Đăng nhập',tr:'Giriş yap'};
export default function ServicesHeader({ language, chooseLanguage, showDirectory = false }: { showDirectory?: boolean; language: InterfaceLanguage; chooseLanguage: (value: InterfaceLanguage) => void }) {
  const t = serviceLabels[language];
  const authLabels = language === 'uz' ? { signOut: 'Chiqish', signOutError: 'Chiqib bo‘lmadi. Qayta urinib ko‘ring.' } : accountLabels[language];
  const { user, ready } = useAccount();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const signOutLock = useRef(false);
  async function signOut() {
    if (signOutLock.current) return;
    signOutLock.current = true; setSigningOut(true); setSignOutError(false);
    try {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration('/');
          const subscription = await registration?.pushManager?.getSubscription();
          if (subscription) { await subscription.unsubscribe(); await supabase.from('esx_push_subscriptions').delete().eq('endpoint', subscription.endpoint); }
        }
      } catch {}
      const { error } = await supabase.auth.signOut();
      if (error) setSignOutError(true);
    } catch { setSignOutError(true); }
    finally { signOutLock.current = false; setSigningOut(false); }
  }
  const [menuOpen,setMenuOpen]=useState(false);
  const menuId=useId();
  const headerRef=useRef<HTMLElement>(null);
  const languagePickerRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeLanguagePicker = (event: PointerEvent) => {
      const picker = languagePickerRef.current;
      if (picker?.open && event.target instanceof Node && !picker.contains(event.target)) picker.open = false;
    };
    document.addEventListener('pointerdown', closeLanguagePicker);
    return () => document.removeEventListener('pointerdown', closeLanguagePicker);
  }, []);

  const toggleRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!menuOpen)return;const close=(event:PointerEvent)=>{if(!headerRef.current?.contains(event.target as Node))setMenuOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[menuOpen]);
  useEffect(()=>{const media=window.matchMedia('(max-width:760px)');const closeOnDesktop=()=>{if(!media.matches)setMenuOpen(false);};media.addEventListener('change',closeOnDesktop);return()=>media.removeEventListener('change',closeOnDesktop);},[]);
  return <><div className="services-menu-backdrop" data-open={menuOpen} aria-hidden="true" onClick={()=>{setMenuOpen(false);toggleRef.current?.focus();}} /><header ref={headerRef} className="services-top services-glass-header" data-menu-open={menuOpen} onKeyDown={event=>{if(event.key==='Escape' && menuOpen){setMenuOpen(false);toggleRef.current?.focus();}}}><Link className="services-brand" href="/" aria-label={"ESX — " + t[2]}><Image src="/esx-wordmark-color.png" alt="ESX" width={140} height={48} unoptimized /><span> / {t[1]}</span></Link><div id={menuId} className="services-header-menu"><nav aria-label={t[36]} onClick={()=>setMenuOpen(false)}><Link href="/">{t[2]}</Link>{!showDirectory && <Link href="/services/register">{addCompanyLabels[language]}</Link>}{showDirectory && <Link href="/services">{directoryLabels[language]}</Link>}<Link href="/chat">{t[3]} ↗</Link>{ready && user && !user.is_anonymous ? <button className="services-auth-action" type="button" disabled={signingOut} aria-busy={signingOut} onClick={()=>void signOut()}>{authLabels.signOut}</button> : <Link href="/account?mode=login">{signInLabels[language]}</Link>}{signOutError && <span role="alert">{authLabels.signOutError}</span>}</nav></div><div className="services-interface-language"><span id="services-language-label">{t[0]}</span><details ref={languagePickerRef} className="services-language-picker" onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); e.currentTarget.open = false; e.currentTarget.querySelector('summary')?.focus(); } }}><summary aria-labelledby="services-language-label services-language-value"><Image src={'/flags/' + flags[language] + '.svg'} alt="" width={24} height={16} unoptimized /><span id="services-language-value">{interfaceLanguages.find(l => l.code === language)?.name}</span><span aria-hidden="true">▾</span></summary><ul aria-labelledby="services-language-label">{interfaceLanguages.map(l => <li key={l.code}><button type="button" lang={l.code} aria-pressed={language === l.code} onClick={e => { chooseLanguage(l.code); setMenuOpen(false); const picker = e.currentTarget.closest('details'); if (picker) { picker.open = false; picker.querySelector('summary')?.focus(); } }}><Image src={'/flags/' + flags[l.code] + '.svg'} alt="" width={24} height={16} unoptimized /><span>{l.name}</span>{language === l.code && <span aria-hidden="true">✓</span>}</button></li>)}</ul></details></div><button ref={toggleRef} type="button" className="services-menu-toggle" aria-label={t[36]} aria-expanded={menuOpen} aria-controls={menuId} onClick={()=>setMenuOpen(value=>!value)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{menuOpen?<path d="M6 6l12 12M18 6L6 18"/>:<path d="M4 6h16M4 12h16M4 18h16"/>}</svg></button></header></>;
}