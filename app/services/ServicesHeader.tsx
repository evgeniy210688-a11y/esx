'use client';
import Image from 'next/image';
import AdminEntry from '@/app/admin/AdminEntry';
import DirectoryThemeToggle from './DirectoryThemeToggle';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import useAccount from '@/app/account/useAccount';
import { accountLabels } from '@/app/account/accountLabels';
import { supabase } from '@/lib/supabase';
import { interfaceLanguages, serviceLabels, type InterfaceLanguage } from './serviceLabels';
const flags = { ru: 'ru', uz: 'uz', zh: 'cn', vi: 'vn', en: 'gb', ko: 'kr', tr: 'tr' } as const;
const directoryLabels: Record<InterfaceLanguage, string> = { ru: 'Справочник', en: 'Directory', ko: '업체 안내', uz: 'Ma’lumotnoma', zh: '服务目录', vi: 'Danh bạ', tr: 'Rehber' };
const addCompanyLabels: Record<InterfaceLanguage,string> = {ru:'Добавить компанию',en:'Add a company',ko:'업체 등록',uz:'Kompaniya qo‘shish',zh:'添加公司',vi:'Thêm công ty',tr:'Şirket ekle'};
const signInLabels: Record<InterfaceLanguage,string> = {ru:'Войти',en:'Sign in',ko:'로그인',uz:'Kirish',zh:'登录',vi:'Đăng nhập',tr:'Giriş yap'};
export default function ServicesHeader({ language, chooseLanguage, showDirectory = false, directoryHeading = false, search }: { search?: { value: string; onChange: (value: string) => void; label: string; filterLabel: string; filterCount: number; renderFilters: (close: () => void) => ReactNode }; directoryHeading?: boolean; showDirectory?: boolean; language: InterfaceLanguage; chooseLanguage: (value: InterfaceLanguage) => void }) {
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
  const [headerFiltersOpen, setHeaderFiltersOpen] = useState(false);
  const headerFilterButton = useRef<HTMLButtonElement>(null);
  const headerFiltersId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchId = useId();
  const searchInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (searchOpen) searchInput.current?.focus({ preventScroll: true }); }, [searchOpen]);
  useEffect(() => {
    if (!searchOpen) return;
    const close = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) { setSearchOpen(false); setHeaderFiltersOpen(false); }
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [searchOpen]);
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
  return <><div className="services-menu-backdrop" data-open={menuOpen} aria-hidden="true" onClick={()=>{setMenuOpen(false);toggleRef.current?.focus();}} /><header ref={headerRef} className="services-top services-glass-header" data-directory-heading={directoryHeading} data-menu-open={menuOpen} onKeyDown={event=>{if(event.key==='Escape' && menuOpen){setMenuOpen(false);toggleRef.current?.focus();}}}><div className="services-brand-controls"><Link className="services-brand" href="/" aria-label={"ESX — " + t[2]}><Image src="/esx-wordmark-color.png" alt="ESX" width={140} height={48} unoptimized />{!directoryHeading && <span> / {t[1]}</span>}</Link><AdminEntry language={language} compact /></div>{search && <button ref={searchButton} type="button" className="services-header-search-toggle" aria-label={search.label} aria-expanded={searchOpen} aria-controls={searchId} onClick={() => { setMenuOpen(false); setSearchOpen(value => !value); setHeaderFiltersOpen(false); }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button>}<div id={menuId} className="services-header-menu"><nav aria-label={t[36]} onClick={()=>setMenuOpen(false)}><Link href="/">{t[2]}</Link>{!showDirectory && <Link href="/services/register" target="_blank" rel="noopener noreferrer">{addCompanyLabels[language]}</Link>}{showDirectory && <Link href="/services">{directoryLabels[language]}</Link>}<Link href="/chat">{t[3]} ↗</Link>{ready && user && !user.is_anonymous ? <button className="services-auth-action" type="button" disabled={signingOut} aria-busy={signingOut} onClick={()=>void signOut()}>{authLabels.signOut}</button> : <Link href="/account?mode=login">{signInLabels[language]}</Link>}{signOutError && <span role="alert">{authLabels.signOutError}</span>}</nav><DirectoryThemeToggle language={language} /></div><div className="services-interface-language"><span id="services-language-label">{t[0]}</span><details ref={languagePickerRef} className="services-language-picker" onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); e.currentTarget.open = false; e.currentTarget.querySelector('summary')?.focus(); } }}><summary aria-labelledby="services-language-label services-language-value"><Image src={'/flags/' + flags[language] + '.svg'} alt="" width={24} height={16} unoptimized /><span id="services-language-value">{interfaceLanguages.find(l => l.code === language)?.name}</span><span aria-hidden="true">▾</span></summary><ul aria-labelledby="services-language-label">{interfaceLanguages.map(l => <li key={l.code}><button type="button" lang={l.code} aria-pressed={language === l.code} onClick={e => { chooseLanguage(l.code); setMenuOpen(false); const picker = e.currentTarget.closest('details'); if (picker) { picker.open = false; picker.querySelector('summary')?.focus(); } }}><Image src={'/flags/' + flags[l.code] + '.svg'} alt="" width={24} height={16} unoptimized /><span>{l.name}</span>{language === l.code && <span aria-hidden="true">✓</span>}</button></li>)}</ul></details></div><button ref={toggleRef} type="button" className="services-menu-toggle" aria-label={t[36]} aria-expanded={menuOpen} aria-controls={menuId} onClick={()=>{setMenuOpen(value=>!value);setSearchOpen(false);setHeaderFiltersOpen(false);}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{menuOpen?<path d="M6 6l12 12M18 6L6 18"/>:<path d="M4 6h16M4 12h16M4 18h16"/>}</svg></button>{search && <div id={searchId} className="services-header-search-panel" hidden={!searchOpen} onKeyDown={event => { if(event.key === 'Escape') { setSearchOpen(false); setHeaderFiltersOpen(false); searchButton.current?.focus({preventScroll:true}); } }}><div className="services-header-search-row"><input ref={searchInput} type="search" aria-label={search.label} placeholder={search.label} value={search.value} onChange={event => search.onChange(event.target.value)} /><button ref={headerFilterButton} type="button" className="services-filter-toggle services-search-settings" aria-label={search.filterLabel} title={search.filterLabel} aria-expanded={headerFiltersOpen} aria-controls={headerFiltersId} onClick={() => setHeaderFiltersOpen(value => !value)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor"/><circle cx="15" cy="17" r="3" fill="currentColor"/></svg>{search.filterCount > 0 && <span className="services-filter-count">{search.filterCount}</span>}</button></div>{headerFiltersOpen && <section id={headerFiltersId} className="services-filters services-compact-filters services-header-filters" aria-label={search.filterLabel}><div className="services-filter-options">{search.renderFilters(() => { setHeaderFiltersOpen(false); headerFilterButton.current?.focus({ preventScroll: true }); })}</div></section>}</div>}</header></>;
}
