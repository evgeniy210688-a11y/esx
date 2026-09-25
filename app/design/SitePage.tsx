"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { copy, languages, type Language } from './content';
import './design.css';
import BusinessHero from './BusinessHero';
import KoreaSection from './KoreaSection';
import HelpSection from './HelpSection';
import BackToTop from './BackToTop';
import UsefulApps from './UsefulApps';
import AboutDetails from './AboutDetails';
import AccountLink from '../account/AccountLink';
import { supabase } from '@/lib/supabase';
import { contactLabels } from './contactLabels';

const navigation = [{ id: 'home', label: 0 }, { id: 'korea', label: 1 }, { id: 'about', label: 2 }, { id: 'advertising', label: 3 }, { id: 'contact', label: 4 }];
export default function SitePage({ section = 'home' }: { section?: 'home' | 'korea' | 'about' | 'advertising' | 'contact' }) {
  const siteRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLElement>(null);
  const [language,setLanguage] = useState<Language>('en');
  const [draft,setDraft] = useState({name:'',message:''});
  const [saved,setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactError, setContactError] = useState<'' | 'error' | 'unavailable' | 'limited'>('');
  const submissionId = useRef<string | null>(null);
  const sendLock = useRef(false);
  async function sendContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendLock.current || saved) return;
    sendLock.current = true;
    setSending(true);
    setContactError('');
    try {
      submissionId.current ??= crypto.randomUUID();
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: draft.name, message: draft.message, requestId: submissionId.current }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setContactError(response.status === 503 ? 'unavailable' : response.status === 429 ? 'limited' : 'error');
        return;
      }
      setSaved(true);
    } catch { setContactError('error'); }
    finally { sendLock.current = false; setSending(false); }
  }

  const [room,setRoom] = useState('');
  useEffect(() => {
    if (!room) return;
    const frame = requestAnimationFrame(() => {
      inviteRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
      inviteRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [room]);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Element && !event.target.closest('#main-navigation, .menu-toggle, .floating-menu-toggle')) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [menuOpen]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  useEffect(()=>{
    try {
      const lang = localStorage.getItem('esx-language');
      // Restore browser-only preferences after hydration; first visits use English.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if(languages.some(l=>l.code===lang)) setLanguage(lang as Language);
      const stored = localStorage.getItem('esx-contact-draft');
      if(stored) {const value=JSON.parse(stored); if(['name','message'].every(k=>typeof value[k]==='string')) setDraft({name:value.name,message:value.message});}
    } catch {}
  },[]);
  useEffect(()=>{document.documentElement.lang=language;document.title=`ESX — ${copy[language][{ home: 5, korea: 1, about: 2, advertising: 3, contact: 4 }[section]]}`;},[language, section]);
  useEffect(() => {
    const site = siteRef.current;
    if (!site) return;
    const elements = site.querySelectorAll<HTMLElement>(
      '.useful-apps-heading, .useful-app, .help-heading, .help-article, .section-heading, .subheading, .holiday, .place, .source-row, .about, .advertising, .contact, .esx-footer, .economy-heading, .economy-card'
    );
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const documentTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    let frame = 0;
    const update = () => {
      frame = 0;
      elements.forEach(element => {
        const top = documentTop(element) - window.scrollY;
        const progress = Math.max(0, Math.min(1, (window.innerHeight - top) / (window.innerHeight * .55)));
        const focused = element.contains(document.activeElement);
        const offset = motion.matches || focused ? 0 : (1 - progress) * 100;
        element.style.setProperty('--scroll-y', `${offset}px`);
        element.style.setProperty('--scroll-opacity', `${motion.matches || focused ? 1 : .18 + progress * .82}`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    elements.forEach(element => element.classList.add('scroll-driven'));
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(site);
    document.fonts.ready.then(schedule);
    site.addEventListener('focusin', schedule);
    motion.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule);
      resizeObserver.disconnect();
      site.removeEventListener('focusin', schedule);
      motion.removeEventListener('change', schedule);
      elements.forEach(element => {
        element.classList.remove('scroll-driven');
        element.style.removeProperty('--scroll-y');
        element.style.removeProperty('--scroll-opacity');
      });
    };
  }, [section]);
  useEffect(() => {
    const main = siteRef.current?.querySelector('main');
    const animation = main?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, easing: 'ease-in-out' });
    return () => animation?.cancel();
  }, [section]);
  const t=copy[language];
  function navigationHref(id: string) { return id === 'home' ? '/' : '/' + id; }
  function choose(lang:Language) {setLanguage(lang);try {localStorage.setItem('esx-language',lang);}catch{}}
  async function startConversation() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && !session.user.is_anonymous) window.location.assign('/account');
    else setRoom(`${window.location.origin}/chat/${crypto.randomUUID()}`);
  }
  return <div ref={siteRef} className={`esx-site${section === 'korea' ? ' korea-silk-theme' : ''}`} lang={language}><div className="cyber-background" aria-hidden="true"><i className="cyber-circuit circuit-left"/><i className="cyber-circuit circuit-right"/><i className="cyber-halo halo-one"/><i className="cyber-halo halo-two"/><i className="cyber-rail"/></div>
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}><defs><filter id="esx-remove-black" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 1 1 0 0" /></filter></defs></svg>
    <header className={`esx-header ${menuOpen ? "menu-open" : ""}`} ><span aria-hidden="true" className="header-glass" style={{ backdropFilter: "blur(24px) saturate(145%)", WebkitBackdropFilter: "blur(24px) saturate(145%)" }} /><div className="header-inner">
      <a className="header-logo" href={navigationHref('home')} aria-label={`ESX — ${t[0]}`}><Image src="/esx-logo.png" alt="ESX" width={1254} height={1254} sizes="(max-width: 760px) 64px, 80px" preload /></a>
      <button type="button" className="menu-toggle" aria-label={t[44]} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
      <nav id="main-navigation" aria-label={t[44]}>{navigation.map(({id,label:i})=><Link style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }} onClick={() => setMenuOpen(false)} className={i===4?'nav-contact':''} href={navigationHref(id)} key={id}>{t[i]}{i===4&&<span>↗</span>}</Link>)}<AccountLink language={language} onClick={() => setMenuOpen(false)} /></nav>
    </div></header>
    {menuOpen && <div className="mobile-menu-backdrop" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }} aria-hidden="true" onClick={() => setMenuOpen(false)} />}
    <main key={section} className="site-main page-enter">
      <section className="language-panel" aria-label={t[10]}><div className="language-label"><span>◎</span><div><strong>{t[10]}</strong><small>{t[11]}</small></div></div><div className="language-row">{languages.map(l=><button lang={l.code} key={l.code} onClick={()=>choose(l.code)} aria-pressed={language===l.code} className={language===l.code?'selected':''}>{l.name}</button>)}</div></section>
      {section === 'korea' && <KoreaSection language={language} />}
      {section === 'advertising' && (
<section id="advertising" className="advertising"><div><div className="eyebrow">{t[3]}</div><h1 style={{ fontSize: 'clamp(30px, 3.3vw, 43px)', lineHeight: 1.1 }}>{t[26]}</h1><p>{t[27]}</p><a href="/contact" className="button light">{t[31]} ↗</a></div><div className="ad-formats"><small>{t[45]}</small>{[28,29,30].map((n,i)=><div key={n}><span>0{i+1}</span><h3>{t[n]}</h3><span>↗</span></div>)}</div></section>
      )}
      {section === 'home' && <>
      <BusinessHero language={language} onStart={startConversation} />
      {room&&<section ref={inviteRef} tabIndex={-1} className="invite" aria-label={t[12]}><div><h2>{t[12]}</h2><p>{t[13]}</p><a className="button blue" href={room}>{t[8]} ↗</a></div><QRCodeSVG value={room} size={180} title={t[12]}/></section>}
      <UsefulApps language={language} />



      <HelpSection language={language} />
      </>}
      {section === 'about' && (
      <section id="about" className="about"><div className="about-art" aria-hidden="true"><Image src="/about-chat.png" alt="" fill sizes="(max-width: 760px) calc(100vw - 32px), 50vw" style={{ objectFit: "cover", objectPosition: "center" }} /></div><div><div className="eyebrow blue-ink">{t[2]}</div><h1 style={{ fontSize: 'clamp(30px, 3.3vw, 43px)', lineHeight: 1.1 }}>{t[24]}</h1><p>{t[25]}</p><a href="/contact" className="text-link">{t[4]} ↗</a></div></section>
      )}
      {section === 'about' && <AboutDetails language={language} />}
      {section === 'contact' && (
      <section id="contact" className="contact"><div><div className="eyebrow blue-ink">{t[4]}</div><h1 style={{ fontSize: 'clamp(30px, 3.3vw, 43px)', lineHeight: 1.1 }}>{t[32]}</h1><p>{t[33]}</p><div className="contact-phone" aria-label="English / 한국어"><div className="phone-speaker" aria-hidden="true"/><div className="phone-chat-title">ESX<span>EN ↔ KO</span></div><div className="phone-messages"><div className="phone-message incoming"><span lang="en">Hi! How are you?</span><small lang="ko">안녕하세요! 잘 지내세요?</small></div><div className="phone-message outgoing"><span lang="ko">네, 잘 지내요! 반가워요.</span><small lang="en">I am doing well! Nice to meet you.</small></div></div><div className="phone-compose" aria-hidden="true"><span>···</span><span>↑</span></div><div className="phone-home" aria-hidden="true"/></div></div><form onSubmit={sendContact} aria-busy={sending}><label><span>{t[34]} <small style={{fontSize:'0.75em',fontWeight:400}}>({contactLabels[language].optional})</small></span><input disabled={sending} maxLength={100} type="text" autoComplete="name" value={draft.name} onChange={e=>{setDraft({...draft,name:e.target.value});setSaved(false);setContactError('');submissionId.current=null;}}/></label><label>{t[36]}<textarea required disabled={sending} maxLength={5000} rows={4} value={draft.message} onChange={e=>{setDraft({...draft,message:e.target.value});setSaved(false);setContactError('');submissionId.current=null;}}/></label><p className="form-note">{contactLabels[language].help}</p><button className="button blue" type="submit" disabled={sending || saved}>{sending ? contactLabels[language].sending : contactLabels[language].button} ↗</button><p role="status" aria-live="polite">{contactError ? contactLabels[language][contactError] : saved ? contactLabels[language].status : ''}</p></form></section>
      )}
    </main>
    <footer className="esx-footer"><div><a className="footer-logo" href={navigationHref('home')} aria-label={`ESX — ${t[0]}`}><Image src="/esx-logo-white.svg" alt="ESX" width={100} height={100} unoptimized /></a><p>{t[40]}</p></div><nav aria-label={t[44]}>{navigation.map(({id,label:i})=><a href={navigationHref(id)} key={id}>{t[i]}</a>)}<AccountLink language={language} /></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} ESX</span><span>{t[5]} ↗</span></div></footer>
    <button type="button" className="back-to-top floating-menu-toggle" aria-label={t[44]} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(value => !value)}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={menuOpen ? 'M6 6L18 18M18 6L6 18' : 'M4 6H20M4 12H20M4 18H20'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
    </button>
    <button type="button" className="back-to-top floating-chat-toggle" aria-label={t[8]} title={t[8]} onClick={async () => { const { data: { session } } = await supabase.auth.getSession(); window.location.assign(session && !session.user.is_anonymous ? '/account' : `/chat/${crypto.randomUUID()}`); }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 3v-11a9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
    </button>
    <BackToTop language={language} />
  </div>;
}


